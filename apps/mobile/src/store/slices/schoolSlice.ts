import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SchoolState {
  activeSchoolId: string | null;
  activeSchoolName: string | null;
}

const initialState: SchoolState = {
  activeSchoolId: null,
  activeSchoolName: null,
};

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setActiveSchool: (
      state,
      action: PayloadAction<{ schoolId: string; schoolName: string }>
    ) => {
      state.activeSchoolId = action.payload.schoolId;
      state.activeSchoolName = action.payload.schoolName;
    },
    clearActiveSchool: (state) => {
      state.activeSchoolId = null;
      state.activeSchoolName = null;
    },
  },
});

export const { setActiveSchool, clearActiveSchool } = schoolSlice.actions;
export default schoolSlice.reducer;
