exports.checkFieldsPresence = (next, ...fields) => {
    const isOk = fields.every(field => field);
    if (!isOk) {
        return next(
            new AppError('Please provide all fields with correct data', 400)
        );
    }
};
