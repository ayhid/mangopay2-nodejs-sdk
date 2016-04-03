/**
 * WORK IN PROGRESS
 */
var _ = require('underscore');
var fs = require('fs');
var Service = require('../service');

var UserNatural = require('../models/UserNatural');
var UserLegal = require('../models/UserLegal');
var PersonType = require('../models/PersonType');
var BankAccountDetailsCA = require('../models/BankAccountDetailsCA');
var BankAccountDetailsGB = require('../models/BankAccountDetailsGB');
var BankAccountDetailsIBAN = require('../models/BankAccountDetailsIBAN');
var BankAccountDetailsOTHER = require('../models/BankAccountDetailsOTHER');
var BankAccountDetailsUS = require('../models/BankAccountDetailsUS');
var BankAccount = require('../models/BankAccount');
var Wallet = require('../models/Wallet');
var Transaction = require('../models/Transaction');
var Card = require('../models/Card');
var KycDocument = require('../models/KycDocument');


var Users = Service.extend({
    /**
     * Create a new user
     * @param {Object} user     Can be a UserNatural, UserLegal or a hash of user properties.
     * @return {Object}         Promise of the request
     */
    create: function(user, callback, options) {
        options = this._api._getOptions(callback, options);

        // If it's a Model instance, attributes will be retrieved from data, otherwise it should be a hash of props
        var userData = user.data || user;

        options = _.extend(options, {
            data: user
        });

        var userCreateDetails = this._getUserApiAndClass(user);
        options.dataClass = userCreateDetails.userClass;

        return this._api.method(userCreateDetails.createApiMethod, callback, options);
    },

    /**
     * Get all users
     * @returns {Object}    Request promise
     */
    getAll: function(callback, options) {
        return this._api.method('users_all', callback, options);
    },

    /**
     * Get natural or legal user by ID
     * @param {number}  userId  User identifier
     * @param callback
     * @param options
     * @returns {Object}        Request promise
     */
    get: function(userId, callback, options) {
        options = this._api._getOptions(callback, options);
        options = _.extend({}, options, {
            path: {
                id: userId
            }
        });

        return this._api.method('users_get', callback, options);
    },

    /**
     * Get natural user by ID
     * @param {number} userId       User identifier
     * @param callback              Callback function
     * @param {Object}  options     Request options
     * @return {Object}             Request promise
     */
    getNatural: function(userId, callback, options) {
        options = this._api._getOptions(callback, options);
        options = _.extend({}, options, {
            path: {
                id: userId
            },
            dataClass: UserNatural
        });

        return this._api.method('users_getnaturals', callback, options);
    },

    /**
     * Get legal user by ID
     * @param {number} userId       User identifier
     * @param callback              Callback function
     * @param {Object}  options     Request options
     * @return {Object}             Request promise
     */
    getLegal: function(userId, callback, options) {
        options = this._api._getOptions(callback, options);
        options = _.extend({}, options, {
            path: {
                id: userId
            },
            dataClass: UserLegal
        });

        return this._api.method('users_getlegals', callback, options);
    },

    /**
     * Save user
     * @param {Object}      user        User object to be saved
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    update: function(user, callback, options) {
        options = this._api._getOptions(callback, options);

        var userSaveDetails = this._getUserApiAndClass(user);
        options.dataClass = userSaveDetails.userClass;

        return this._api.method(userSaveDetails.saveApiMethod, callback, options);
    },

    /**
     * Create bank account for user
     * @param {number}      userId          User identifier
     * @param {Object}      bankAccount     Bank account object
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                     Request promise
     */
    createBankAccount: function(userId, bankAccount, callback, options) {
        var options = this._api._getOptions(callback, options);

        options = _.extend({}, options, {
            path: {
                id: userId
            },
            dataClass: BankAccount
        });

        var createBankAccountApiMethod = 'users_createbankaccounts_' + this._getBankAccountType(bankAccount);
        return this._api.method(createBankAccountApiMethod, callback, options);
    },

    /**
     * Get all bank accounts for user
     * @param {number}      userId      User identifier
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    getBankAccounts: function(userId, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            }
        });

        return this._api.method('users_allbankaccount', callback, options);
    },

    /**
     * Get all bank accounts for user
     * @param {number}      userId              User identifier
     * @param {number}      bankAccountId       Bank account id
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                         Request promise
     */
    getBankAccount: function(userId, bankAccountId, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId,
                bankAccountId: bankAccountId
            },
            dataClass: BankAccount
        });

        return this._api.method('users_getbankaccount', callback, options);
    },

    /**
     * Get all wallets accounts for user
     * @param {number}      userId      User identifier
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    getWallets: function(userId, callback, options){
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            },
            dataClass: Wallet
        });

        return this._api.method('users_allwallets', callback, options);
    },

    /**
     * Get all transactions for user
     * @param {number}      userId      User identifier
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    getTransactions: function(userId, callback, options){
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            },
            dataClass: Transaction
        });

        return this._api.method('users_alltransactions', callback, options);
    },

    /**
     * Get all cards for user
     * @param {number}      userId      User identifier
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    getCards: function(userId, callback, options){
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            },
            dataClass: Card
        });

        return this._api.method('users_allcards', callback, options);
    },

    /**
     * Create new KYC document
     * @param {number}      userId      User identifier
     * @param {Object}      kycDocument
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}                 Request promise
     */
    createKycDocument: function(userId, kycDocument, callback, options){
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            },
            data: kycDocument,
            dataClass: KycDocument
        });

        return this._api.method('kyc_documents_create', callback, options);
    },

    /**
     * Get all KYC documents for user
     * @param {number}      userId
     * @param {function}    callback
     * @param {object}      options
     * @return {Object}     Request promise
     */
    getKycDocuments: function(userId, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId
            },
            dataClass: KycDocument
        });

        return this._api.method('users_allkycdocuments', callback, options);
    },

    /**
     * Get KYC document
     * @param {number}      userId
     * @param {number}      kycDocumentId
     * @param {function}    callback
     * @param {object}      options
     * @return {Object}     Request promise
     */
    getKycDocument: function(userId, kycDocumentId, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId,
                documentId: kycDocumentId
            },
            dataClass: KycDocument
        });

        return this._api.method('kyc_documents_get', callback, options);
    },

    /**
     * Save KYC document
     * @param {number}      userId
     * @param {number}      kycDocumentId
     * @param {function}    callback
     * @param {object}      options
     * @return {Object}     Request promise
     */
    updateKycDocument: function(userId, kycDocument, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId,
                documentId: kycDocument.id
            },
            data: kycDocument,
            dataClass: KycDocument
        });

        return this._api.method('kyc_documents_save', callback, options);
    },

    /**
     * Create page for KYC document
     * @param {number}      userId
     * @param {number}      kycDocumentId
     * @param {Object}      kycPage
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}     Request promise
     */
    createKycPage: function(userId, kycDocumentId, kycPage, callback, options) {
        options = this._api._getOptions(callback, options, {
            path: {
                id: userId,
                documentId: kycDocumentId
            },
            data: kycPage
        });

        return this._api.method('kyc_page_create', callback, options);
    },

    /**
     * Create page for KYC document
     * @param {number}      userId
     * @param {number}      kycDocumentId
     * @param {string}      file                File path
     * @param {function}    callback
     * @param {Object}      options
     * @return {Object}     Request promise
     */
    createKycPageFromFile: function(userId, kycDocumentId, file, callback, options) {
        if (!file) this._api.errorHandler({message: 'Path of file cannot be empty', error: file});
        if (!fs.statSync(file)) this._api.errorHandler({message: 'File does not exist', error: file});

        var kycPage = new KycPage({
            File: fs.readSync(file, 'utf8').toString('base64')
        });

        if (!kycPage.File) this._api.errorHandler({message: 'Content of the file cannot be empty', error: file});
        this.createKycPage(userId, kycDocumentId, kycPage, callback, options);
    },

    /**
     * Gets the details for a user instance of hash of properties
     * @param {Object|UserNatural|UserLegal}  user
     */
    _getUserApiAndClass: function(user) {
        if (user instanceof UserNatural || user.PersonType === PersonType.Natural) {
            return {
                createApiMethod: 'users_createnaturals',
                saveApiMethod: 'users_savelegals',
                userClass: UserNatural
            };
        } else if (user instanceof UserLegal || user.PersonType === PersonType.Legal) {
            return {
                createApiMethod: 'users_createlegals',
                saveApiMethod: 'users_savelegals',
                userClass: UserLegal
            };
        } else {
            this._api.errorHandler({
                message: 'Invalid user data',
                error: user
            });
        }
    },

    _getBankAccountType: function(bankAccount) {
        if (bankAccount.Type) {
            return bankAccount.Type;
        }

        if (bankAccount.Details instanceof BankAccountDetailsCA) return 'ca';
        if (bankAccount.Details instanceof BankAccountDetailsGB) return 'gb';
        if (bankAccount.Details instanceof BankAccountDetailsIBAN) return 'iban';
        if (bankAccount.Details instanceof BankAccountDetailsOTHER) return 'other';
        if (bankAccount.Details instanceof BankAccountDetailsUS) return 'us';

    }
});

module.exports = Users;