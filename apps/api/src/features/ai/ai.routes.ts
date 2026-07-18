import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ApiResponse } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import { env } from '../../config/env';
import { supabaseAdmin } from '../../config/supabase';
import { logger } from '../../utils/logger';

const router = Router();

// Endpoint for SchoolBee AI Assistant conversations
router.post('/chat', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant?.schoolId;
    const { conversationId, message, type } = req.body;

    if (!message) {
      throw new BadRequestError('message prompt is required');
    }

    // 1. Resolve or Create Conversation Session
    let convId = conversationId;
    if (!convId) {
      const { data: conv, error: cErr } = await supabaseAdmin
        .from('ai_conversations')
        .insert({
          school_id: schoolId,
          user_id: req.user?.id,
          type: type || 'general',
          title: message.substring(0, 40),
        })
        .select()
        .single();
      
      if (cErr || !conv) throw new BadRequestError('Failed creating AI conversation thread');
      convId = conv.id;
    }

    // 2. Save User Message
    await supabaseAdmin.from('ai_messages').insert({
      school_id: schoolId,
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // 3. Mock AI Engine Processing (OpenAI Integration fallback)
    const aiResponseText = await mockAIActionEngine(message, schoolId, req.user?.id);

    // 4. Save Assistant Message
    await supabaseAdmin.from('ai_messages').insert({
      school_id: schoolId,
      conversation_id: convId,
      role: 'assistant',
      content: aiResponseText,
    });

    return ApiResponse.success(res, {
      conversationId: convId,
      response: aiResponseText,
    });
  } catch (error) {
    next(error);
  }
});

// A lightweight action mapper to simulate OpenAI's tool calling / leaves processing
async function mockAIActionEngine(prompt: string, schoolId?: string, userId?: string): Promise<string> {
  const p = prompt.toLowerCase();

  // Action 1: Leave Requests
  if (p.includes('apply leave') || p.includes('leave for tomorrow')) {
    try {
      // Find linked students
      const { data: pLink } = await supabaseAdmin
        .from('parent_student_links')
        .select('student_id, students(first_name)')
        .eq('school_id', schoolId)
        .limit(1);

      if (pLink && pLink.length > 0) {
        const student = pLink[0];
        const studentId = student.student_id;
        const studentName = (student.students as any)?.first_name || 'your child';
        
        // Write real leave request directly to DB
        await supabaseAdmin.from('leave_requests').insert({
          school_id: schoolId,
          student_id: studentId,
          requested_by_id: userId,
          start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          reason: 'Applied via SchoolBee AI assistant',
          type: 'personal',
          status: 'pending',
        });

        return `✅ I have processed your request and submitted a pending leave application for **${studentName}** for tomorrow.`;
      }
    } catch (e: any) {
      logger.error('AI leave action fail:', e.message);
    }
    return 'I tried applying leave but couldn\'t locate your student link. Please use the Leave Request form.';
  }

  // Action 2: Attendance Status Queries
  if (p.includes('attend') || p.includes('present') || p.includes('absent')) {
    return '📊 Checking Alice\'s records... Yes, she is **Present** at school today. Arrived at **9:02 AM** via Bus 12.';
  }

  // Action 3: Food Queries
  if (p.includes('eat') || p.includes('lunch') || p.includes('food')) {
    return '🍔 Alice had her **Lunch** today. Menu item: Chicken nuggets & apple slices. Status: **Taken** (12:15 PM).';
  }

  // Action 4: Bus Tracking Queries
  if (p.includes('bus') || p.includes('where is')) {
    return '🚌 Route 12 is currently in progress. alice\'s bus is 1.2 miles away. ETA: **7 mins** to drop-off stop.';
  }

  // Fallback
  return `Hi! I'm your SchoolBee AI assistant. I can check attendance status, tell you what your child ate, locate the school bus, or file leave requests automatically. Try asking: "Did Alice eat lunch?" or "Apply leave for tomorrow."`;
}

export default router;
