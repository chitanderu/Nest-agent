import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly WordBookRecord: "WordBookRecord";
    readonly WordBook: "WordBook";
    readonly PaymentRecord: "PaymentRecord";
    readonly CourseRecord: "CourseRecord";
    readonly Course: "Course";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly phone: "phone";
    readonly address: "address";
    readonly password: "password";
    readonly avatar: "avatar";
    readonly wordNumber: "wordNumber";
    readonly dayNumber: "dayNumber";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly lastLoginAt: "lastLoginAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const WordBookRecordScalarFieldEnum: {
    readonly id: "id";
    readonly wordId: "wordId";
    readonly isMaster: "isMaster";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly userId: "userId";
};
export type WordBookRecordScalarFieldEnum = (typeof WordBookRecordScalarFieldEnum)[keyof typeof WordBookRecordScalarFieldEnum];
export declare const WordBookScalarFieldEnum: {
    readonly id: "id";
    readonly word: "word";
    readonly phonetic: "phonetic";
    readonly definition: "definition";
    readonly translation: "translation";
    readonly pos: "pos";
    readonly collins: "collins";
    readonly oxford: "oxford";
    readonly tag: "tag";
    readonly bnc: "bnc";
    readonly frq: "frq";
    readonly exchange: "exchange";
    readonly gk: "gk";
    readonly zk: "zk";
    readonly gre: "gre";
    readonly toefl: "toefl";
    readonly ielts: "ielts";
    readonly cet6: "cet6";
    readonly cet4: "cet4";
    readonly ky: "ky";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WordBookScalarFieldEnum = (typeof WordBookScalarFieldEnum)[keyof typeof WordBookScalarFieldEnum];
export declare const PaymentRecordScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tradeNo: "tradeNo";
    readonly outTradeNo: "outTradeNo";
    readonly amount: "amount";
    readonly subject: "subject";
    readonly body: "body";
    readonly tradeStatus: "tradeStatus";
    readonly sendPayTime: "sendPayTime";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PaymentRecordScalarFieldEnum = (typeof PaymentRecordScalarFieldEnum)[keyof typeof PaymentRecordScalarFieldEnum];
export declare const CourseRecordScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly courseId: "courseId";
    readonly isPurchased: "isPurchased";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly paymentRecordId: "paymentRecordId";
};
export type CourseRecordScalarFieldEnum = (typeof CourseRecordScalarFieldEnum)[keyof typeof CourseRecordScalarFieldEnum];
export declare const CourseScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly value: "value";
    readonly description: "description";
    readonly teacher: "teacher";
    readonly url: "url";
    readonly price: "price";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map