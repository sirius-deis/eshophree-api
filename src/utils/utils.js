exports.checkFieldsPresence = (...fields) => {
    const isOk = fields.every(field => field);
    if (!isOk) {
        throw new AppError('Please provide all fields with correct data', 400);
    }
};
