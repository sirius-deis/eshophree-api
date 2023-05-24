exports.checkFieldsPresence = (next, ...fields) => {
    const isOk = fields.every(field => field);
    if (!isOk) {
        next(new AppError('Please provide all fields with correct data', 400));
    }
    return true;
};
