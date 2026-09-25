const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of the following roles: ${roles.join(', ')}. Current role: ${req.user.role}`
            });
        }

        next();
    };
};

module.exports = authorize;
