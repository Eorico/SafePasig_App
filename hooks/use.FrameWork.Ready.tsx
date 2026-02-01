import { useEffect } from "react";

declare global {
    interface Window {
        frameWorkReady?: () => void;
    }
}

export function useFrameworkReady() {
    useEffect(() => {
        window.frameWorkReady?.();
    })
}