import React from "react";

export function useInterval(callback, delay) {
    const intervalRef = React.useRef();
    const callbackRef = React.useRef(callback);

    React.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    React.useEffect(() => {
        if (typeof delay === 'number') {
            intervalRef.current = setInterval(() => callbackRef.current(), delay);

            return () => clearInterval(intervalRef.current);
        }
    }, [delay]);

    return intervalRef;
}