function catchWrap(originalFunction) {
    return async function(req, res, next) {
        try {
            return await originalFunction.call(this, req, res, next);
        } catch (e) {
            next(e);
        }
    };
}

module.exports = catchWrap;