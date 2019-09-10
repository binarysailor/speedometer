const util = {
    constrain: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    }
};

export default util;
