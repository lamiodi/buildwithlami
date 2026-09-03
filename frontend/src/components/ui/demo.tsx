import React from "react";
import { DotLoader } from "@/components/ui/dot-loader";

export const game = [
    [14, 7, 0, 8, 6, 13, 20],
    [14, 7, 13, 20, 16, 27, 21],
    [14, 20, 27, 21, 34, 24, 28],
    [27, 21, 34, 28, 41, 32, 35],
    [34, 28, 41, 35, 48, 40, 42],
    [34, 28, 41, 35, 48, 42, 46],
    [34, 28, 41, 35, 48, 42, 38],
    [34, 28, 41, 35, 48, 30, 21],
    [34, 28, 41, 48, 21, 22, 14],
    [34, 28, 41, 21, 14, 16, 27],
    [34, 28, 21, 14, 10, 20, 27],
    [28, 21, 14, 4, 13, 20, 27],
    [28, 21, 14, 12, 6, 13, 20],
    [28, 21, 14, 6, 13, 20, 11],
    [28, 21, 14, 6, 13, 20, 10],
    [14, 6, 13, 20, 9, 7, 21],
];

export const Demo = () => {
    return (
        <div className="inline-flex items-center gap-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#09090b] px-4 py-2.5 text-gray-900 dark:text-white shadow-sm transition-colors duration-300 select-none">
            <div className="flex items-center justify-center">
                <DotLoader
                    frames={game}
                    duration={80}
                    className="gap-0.5"
                    dotClassName="bg-black/10 dark:bg-white/15 [&.active]:bg-accent size-1.5 rounded-[1px]"
                />
            </div>

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10" />

            {/* Actual uncropped logo in light and dark mode */}
            <div className="flex items-center gap-2">
                <img
                    src="/2.png"
                    alt="BuildWith_Lami"
                    className="h-6 sm:h-7 w-auto object-contain block dark:hidden"
                />
                <img
                    src="/1.png"
                    alt="BuildWith_Lami"
                    className="h-6 sm:h-7 w-auto object-contain hidden dark:block"
                />
                <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap leading-none">
                    <span className="text-accent">BuildWith</span>
                    <span className="text-gray-900 dark:text-white">_Lami</span>
                </span>
            </div>
        </div>
    );
};

export default Demo;
