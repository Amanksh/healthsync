"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = exports.ROLES_KEY = exports.Roles = void 0;
var roles_decorator_1 = require("./decorators/roles.decorator");
Object.defineProperty(exports, "Roles", { enumerable: true, get: function () { return roles_decorator_1.Roles; } });
Object.defineProperty(exports, "ROLES_KEY", { enumerable: true, get: function () { return roles_decorator_1.ROLES_KEY; } });
var roles_guard_1 = require("./guards/roles.guard");
Object.defineProperty(exports, "RolesGuard", { enumerable: true, get: function () { return roles_guard_1.RolesGuard; } });
//# sourceMappingURL=index.js.map