exports.filterObjectFields = (object, ...skipFields) => {
    const newObj = {};
    const keys = Object.keys(object);

    for (let i = 0; i < keys.length; i++) {
        if (skipFields.includes(keys[i])) {
            continue;
        } else {
            newObj[keys[i]] = object[keys[i]];
        }
    }
    return newObj;
};
