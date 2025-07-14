import { useEffect, useRef } from "react";

/**
 * Custom hook để auto refresh data tự động
 * @param {Function} refreshFunction - Function để gọi khi refresh
 * @param {number} interval - Thời gian interval (ms), mặc định 30 giây
 * @param {boolean} enabled - Có enable auto refresh không, mặc định true
 */
const useAutoRefresh = (refreshFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);
  const refreshFunctionRef = useRef(refreshFunction);

  // Cập nhật ref khi refreshFunction thay đổi
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  // Setup auto refresh interval
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

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};

export default useAutoRefresh;
