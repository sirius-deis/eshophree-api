exports.addToObjectIfValuesExist = values => {
    const map = {};
    let isAdded = false;
    for (let key in values) {
        if (values[key]) {
            map[key] = values[key];
            isAdded = true;
        }
    }
    return isAdded && map;
};
