export const useGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 22) return 'Working late';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};
