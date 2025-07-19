import { useEffect, useRef } from "react";

/**
 * Hook để tự động refresh một hàm theo khoảng thời gian nhất định
 * @param {Function} refreshFunction - Function để gọi khi refresh
 * @param {number} interval  mặc định 30 giây
 * @param {boolean} enabled  mặc định true
 */
const useAutoRefresh = (refreshFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);
  const refreshFunctionRef = useRef(refreshFunction);

  // Cập nhật ref khi refreshFunction thay đổi
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const runAutoRefresh = async () => {
      try {
        await refreshFunctionRef.current();
      } catch (error) {
        console.error("Error during auto refresh:", error);
      }
    };

    intervalRef.current = setInterval(runAutoRefresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

export default useAutoRefresh;
