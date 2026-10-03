import type { UseTaskBoardReturn } from '../../../hooks/board/useTaskBoard';
import type { AppUiState } from '../../../hooks/board/useAppUiState';

export interface SlotProps {
  board: Pick<
    UseTaskBoardReturn,
    | 'tasks'
    | 'timelineConfig'
    | 'timelineRange'
    | 'addTask'
    | 'addEmployee'
    | 'updateTask'
    | 'deleteTask'
    | 'updateEmployee'
    | 'deleteEmployee'
  >;
  ui: AppUiState;
}