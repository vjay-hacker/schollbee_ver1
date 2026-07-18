import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { supabaseAdmin } from '../../config/supabase';
import { logger } from '../../utils/logger';
import { z } from 'zod';

const router = Router();

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const CreateCircularSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().min(10),
  audience: z.enum(['all', 'parents', 'teachers', 'students', 'class_specific']).default('all'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  class_id: z.string().uuid().optional(),
  section_id: z.string().uuid().optional(),
  schedule_at: z.string().datetime().optional(),
  attachment_urls: z.array(z.string().url()).optional().default([]),
  languages: z.array(z.enum(['en', 'ta', 'hi', 'fr', 'ar'])).optional().default(['en']),
});

const SendChatMessageSchema = z.object({
  recipient_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'image', 'document', 'audio']).default('text'),
  attachment_url: z.string().url().optional(),
  parent_message_id: z.string().uuid().optional(),
});

const MarkReadSchema = z.object({
  message_ids: z.array(z.string().uuid()),
});

// ─── MULTI-LANG TRANSLATION HELPER ──────────────────────────────────────────

const TRANSLATIONS_MOCK: Record<string, Record<string, string>> = {
  greeting: {
    en: 'Dear Parent/Guardian',
    ta: 'அன்பான பெற்றோர்/பாதுகாவலர்',
    hi: 'प्रिय अभिभावक/संरक्षक',
    fr: 'Cher parent/tuteur',
    ar: 'عزيزي الوالد/الوصي',
  },
  closing: {
    en: 'Regards, School Administration',
    ta: 'மரியாதையுடன், பள்ளி நிர்வாகம்',
    hi: 'सादर, विद्यालय प्रशासन',
    fr: 'Cordialement, Administration scolaire',
    ar: 'مع التحية، إدارة المدرسة',
  },
};

async function translateCircular(
  title: string,
  body: string,
  targetLanguages: string[]
): Promise<Record<string, { title: string; body: string }>> {
  const translations: Record<string, { title: string; body: string }> = {};

  for (const lang of targetLanguages) {
    if (lang === 'en') {
      translations['en'] = { title, body };
      continue;
    }
    // In production this would call Google Cloud Translate / DeepL / Azure Cognitive Services
    // For now we wrap with locale greeting + body (indicating translation ready slot)
    const greeting = TRANSLATIONS_MOCK.greeting[lang] || TRANSLATIONS_MOCK.greeting['en'];
    const closing = TRANSLATIONS_MOCK.closing[lang] || TRANSLATIONS_MOCK.closing['en'];
    translations[lang] = {
      title: `[${lang.toUpperCase()}] ${title}`,
      body: `${greeting},\n\n${body}\n\n${closing}`,
    };
    logger.info(`Circular translated to language: ${lang} (integration slot ready)`);
  }

  return translations;
}

// ─── CIRCULARS / BROADCASTS ──────────────────────────────────────────────────

// POST /api/v1/communication/circulars — Create and publish a circular
router.post('/circulars', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = CreateCircularSchema.parse(req.body);

    // Translate to all requested languages
    const translations = await translateCircular(body.title, body.body, body.languages || ['en']);

    // Insert the circular
    const { data: circular, error: cErr } = await supabaseAdmin
      .from('announcements')
      .insert({
        school_id: schoolId,
        created_by_id: req.user?.id,
        title: body.title,
        content: body.body,
        audience: body.audience,
        priority: body.priority,
        class_id: body.class_id,
        section_id: body.section_id,
        scheduled_at: body.schedule_at,
        attachment_urls: body.attachment_urls,
        translations,
        status: body.schedule_at ? 'scheduled' : 'published',
        published_at: body.schedule_at ? null : new Date().toISOString(),
      })
      .select()
      .single();

    if (cErr || !circular) throw new BadRequestError(cErr?.message || 'Failed to create circular');

    // Queue push notifications (FCM) to relevant audience
    // In production this triggers the notification dispatcher service
    logger.info(`Circular published: ${circular.id} | audience: ${body.audience} | school: ${schoolId}`);

    // Create notification records for each target user
    if (body.audience !== 'class_specific') {
      let roleFilter: string[] = [];
      if (body.audience === 'parents') roleFilter = ['parent'];
      if (body.audience === 'teachers') roleFilter = ['teacher'];
      if (body.audience === 'students') roleFilter = ['student'];
      if (body.audience === 'all') roleFilter = ['parent', 'teacher', 'student'];

      if (roleFilter.length > 0) {
        const { data: users } = await supabaseAdmin
          .from('user_roles')
          .select('user_id')
          .eq('school_id', schoolId)
          .in('role', roleFilter)
          .limit(500);

        if (users && users.length > 0) {
          const notifRecords = users.map((u: any) => ({
            school_id: schoolId,
            user_id: u.user_id,
            title: body.title,
            body: body.body.substring(0, 200),
            type: 'circular',
            reference_id: circular.id,
            is_read: false,
          }));

          const { error: nErr } = await supabaseAdmin.from('notifications').insert(notifRecords);
          if (nErr) logger.warn(`Notification fan-out partial error: ${nErr.message}`);
          else logger.info(`Notification dispatched to ${notifRecords.length} users`);
        }
      }
    }

    return ApiResponse.created(res, {
      ...circular,
      translations,
      notification_queued: true,
    }, 'Circular published successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communication/circulars — List all circulars for school
router.get('/circulars', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { audience, priority, page = '1', limit = '20', status = 'published' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = supabaseAdmin
      .from('announcements')
      .select('*, users(full_name, avatar_url)', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('status', status)
      .order('published_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (audience) query = query.eq('audience', audience);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);

    return ApiResponse.success(res, { circulars: data || [], total: count, page: parseInt(page as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communication/circulars/:id — Get single circular detail
router.get('/circulars/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const schoolId = req.tenant?.schoolId;

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*, users(full_name, avatar_url)')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error || !data) throw new NotFoundError('Circular not found');
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

// ─── PARENT-TEACHER CHAT ─────────────────────────────────────────────────────

// POST /api/v1/communication/chat — Send a chat message
router.post('/chat', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = SendChatMessageSchema.parse(req.body);
    const senderId = req.user?.id;

    // Validate recipient exists within school
    const { data: recipient } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .eq('school_id', schoolId)
      .eq('user_id', body.recipient_id)
      .single();

    if (!recipient) throw new NotFoundError('Recipient not found in this school');

    // Create conversation thread if not existing
    const participantsSorted = [senderId, body.recipient_id].sort();
    const threadKey = `${participantsSorted[0]}_${participantsSorted[1]}`;

    // Insert message to chat_messages table
    const { data: message, error: mErr } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        school_id: schoolId,
        thread_key: threadKey,
        sender_id: senderId,
        recipient_id: body.recipient_id,
        content: body.content,
        message_type: body.message_type,
        attachment_url: body.attachment_url,
        parent_message_id: body.parent_message_id,
        is_read: false,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (mErr || !message) throw new BadRequestError(mErr?.message || 'Failed to send message');

    // Create notification for recipient
    await supabaseAdmin.from('notifications').insert({
      school_id: schoolId,
      user_id: body.recipient_id,
      title: 'New message',
      body: body.content.substring(0, 100),
      type: 'chat',
      reference_id: message.id,
      is_read: false,
    });

    logger.info(`Chat message sent: ${senderId} → ${body.recipient_id} (thread: ${threadKey})`);
    return ApiResponse.created(res, message, 'Message sent');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communication/chat/:recipientId — Get conversation thread
router.get('/chat/:recipientId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientId } = req.params;
    const schoolId = req.tenant?.schoolId;
    const senderId = req.user?.id;
    const { page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const participantsSorted = [senderId, recipientId].sort();
    const threadKey = `${participantsSorted[0]}_${participantsSorted[1]}`;

    const { data: messages, error, count } = await supabaseAdmin
      .from('chat_messages')
      .select('*, sender:users!sender_id(full_name, avatar_url)', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('thread_key', threadKey)
      .order('sent_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) throw new BadRequestError(error.message);

    // Auto-mark incoming messages as read
    await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('thread_key', threadKey)
      .eq('recipient_id', senderId)
      .eq('is_read', false);

    return ApiResponse.success(res, {
      thread_key: threadKey,
      messages: (messages || []).reverse(),
      total: count,
      page: parseInt(page as string),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communication/chat — List all conversations (inbox)
router.get('/chat', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const userId = req.user?.id;

    // Get latest message per thread involving this user
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*, sender:users!sender_id(full_name, avatar_url), recipient:users!recipient_id(full_name, avatar_url)')
      .eq('school_id', schoolId)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('sent_at', { ascending: false })
      .limit(200);

    if (error) throw new BadRequestError(error.message);

    // Deduplicate by thread_key
    const threadMap: Record<string, any> = {};
    for (const msg of messages || []) {
      if (!threadMap[msg.thread_key]) {
        threadMap[msg.thread_key] = {
          thread_key: msg.thread_key,
          last_message: msg,
          other_participant: msg.sender_id === userId ? msg.recipient : msg.sender,
          unread_count: 0,
        };
      }
      if (msg.recipient_id === userId && !msg.is_read) {
        threadMap[msg.thread_key].unread_count++;
      }
    }

    const conversations = Object.values(threadMap).sort(
      (a, b) => new Date(b.last_message.sent_at).getTime() - new Date(a.last_message.sent_at).getTime()
    );

    return ApiResponse.success(res, { conversations, total: conversations.length });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/communication/chat/read — Mark messages as read
router.put('/chat/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const body = MarkReadSchema.parse(req.body);
    const userId = req.user?.id;

    const { error } = await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', body.message_ids)
      .eq('recipient_id', userId)
      .eq('school_id', schoolId);

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, { updated: body.message_ids.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communication/notifications — User notifications
router.get('/notifications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const userId = req.user?.id;
    const { unread_only = 'false', page = '1', limit = '30' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (unread_only === 'true') query = query.eq('is_read', false);

    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);

    // Count unread
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('user_id', userId)
      .eq('is_read', false);

    return ApiResponse.success(res, {
      notifications: data || [],
      total: count,
      unread_count: unreadCount || 0,
      page: parseInt(page as string),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/communication/notifications/read-all — Mark all read
router.post('/notifications/read-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const userId = req.user?.id;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('school_id', schoolId)
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new BadRequestError(error.message);
    return ApiResponse.success(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
