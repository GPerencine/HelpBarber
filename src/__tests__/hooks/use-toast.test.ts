import { act, renderHook } from '@testing-library/react';
import { useToast, toast, reducer } from '@/hooks/use-toast';

describe('useToast Hook & Reducer', () => {
  beforeEach(() => {
    // Dismiss all toasts to reset memory state between tests
    act(() => {
      toast({ title: 'reset' }).dismiss();
    });
  });

  describe('reducer', () => {
    it('should add a toast', () => {
      const state = { toasts: [] };
      const action = {
        type: 'ADD_TOAST' as const,
        toast: { id: '1', title: 'Test Toast', open: true },
      };

      const newState = reducer(state, action);
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('1');
    });

    it('should update a toast', () => {
      const state = { toasts: [{ id: '1', title: 'Old Title', open: true }] };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'New Title' },
      };

      const newState = reducer(state, action);
      expect(newState.toasts[0].title).toBe('New Title');
    });

    it('should update a toast and leave other toasts unchanged', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'New Toast 1' },
      };

      const newState = reducer(state, action);
      expect(newState.toasts[0].title).toBe('New Toast 1');
      expect(newState.toasts[1].title).toBe('Toast 2');
    });

    it('should dismiss a toast', () => {
      const state = { toasts: [{ id: '1', title: 'Test', open: true }] };
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1',
      };

      const newState = reducer(state, action);
      expect(newState.toasts[0].open).toBe(false);
    });

    it('should dismiss only the specified toast and keep others open', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1',
      };

      const newState = reducer(state, action);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    it('should dismiss all toasts if toastId is undefined', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Test 1', open: true },
          { id: '2', title: 'Test 2', open: true },
        ],
      };
      const action = {
        type: 'DISMISS_TOAST' as const,
      };

      const newState = reducer(state, action);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(false);
    });

    it('should remove a toast', () => {
      const state = { toasts: [{ id: '1', title: 'Test', open: true }] };
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1',
      };

      const newState = reducer(state, action);
      expect(newState.toasts).toHaveLength(0);
    });

    it('should remove all toasts if toastId is undefined', () => {
      const state = { toasts: [{ id: '1', title: 'Test', open: true }] };
      const action = {
        type: 'REMOVE_TOAST' as const,
      };

      const newState = reducer(state, action);
      expect(newState.toasts).toHaveLength(0);
    });
  });

  describe('useToast hook', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useToast());
      expect(result.current.toasts).toBeDefined();
    });

    it('should add a toast via toast() function', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: 'Hook Toast', description: 'Desc' });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Hook Toast');
    });

    it('should allow dismissing a toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        const t = toast({ title: 'To Dismiss' });
        toastId = t.id;
      });

      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        result.current.dismiss(toastId);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should dismiss toast when onOpenChange is called with false', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: 'OnOpenChange test' });
      });

      act(() => {
        const t = result.current.toasts[0];
        if (t.onOpenChange) {
          t.onOpenChange(false);
        }
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should automatically remove toast after delay', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: 'Auto remove' }).dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);

      act(() => {
        jest.advanceTimersByTime(1000000);
      });

      expect(result.current.toasts).toHaveLength(0);
      jest.useRealTimers();
    });

    it('should allow updating a toast', () => {
      const { result } = renderHook(() => useToast());

      let updateFn: (props: any) => void;
      act(() => {
        const t = toast({ title: 'Initial' });
        updateFn = t.update;
      });

      expect(result.current.toasts[0].title).toBe('Initial');

      act(() => {
        updateFn({ id: result.current.toasts[0].id, title: 'Updated Title' });
      });

      expect(result.current.toasts[0].title).toBe('Updated Title');
    });
  });
});
