"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.getDb = void 0;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
var getDb = function () {
    var _a;
    if (!firebase_admin_1.default.apps.length) {
        if (!process.env.FIREBASE_PROJECT_ID) {
            console.warn('FIREBASE_PROJECT_ID is missing');
            return null;
        }
        try {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
                }),
            });
        }
        catch (error) {
            console.error('Firebase admin initialization error', error);
            return null;
        }
    }
    return firebase_admin_1.default.firestore();
};
exports.getDb = getDb;
