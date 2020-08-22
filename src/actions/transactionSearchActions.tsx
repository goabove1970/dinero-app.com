import * as constants from '../constants';
import { SessionData } from '../types';


export interface TransactionSearchRequested {
    type: constants.TRANSACTION_SEARCH_REQUESTED;
    payload: string;
}

export interface TransactionSearchCleared {
    type: constants.TRANSACTION_SEARCH_CLEAR;
}



export type TransactionSearchActions = TransactionSearchRequested |
    TransactionSearchCleared;

export function transactionSearchRequested(pattern: string): TransactionSearchActions {
    return {
        type: constants.TRANSACTION_SEARCH_REQUESTED,
        payload: pattern
    };
}

export function clearTransactionSearch(): TransactionSearchActions {
    return {
        type: constants.TRANSACTION_SEARCH_CLEAR,
    };
}
