import axios from "axios";
import { update } from "lodash";

export default {
    actions: {
        fetchTransactions({commit}) {
            const params = {
                page: this.getters.getPage,
                date_from: this.getters.getDateFrom,
                date_to: this.getters.getDateTo,
                expense_id: this.getters.getExpenseId,
                wallet_id: this.getters.getWalletId,
                income_id: this.getters.getIncomeId,
                type: this.getters.getTypeId
            }
            commit('setErrorStatus', false);
            commit('setLoaded', false);
            axios.get('/api/transactions', {params})
                .then(response => {
                    commit('setTotal', response.data.meta.total);
                    commit('setTransactions', response.data.data);
                    if ((Object.keys(response.data.data).length) === 0) {
                        commit('setErrorStatus', true);
                        commit('setErrorInfo', `За запрошеный период транзакции не производились ...`);
                    } else {
                        commit('setLoaded', true);
                        commit('setErrorStatus', false);

                    }
                })
                .catch(error => {
                    commit('setErrorStatus', true);
                    commit('setErrorInfo', `Ошибка во время запроса транзакций: (${error})`);
                    console.log(error);
                })
        },
    },
    mutations: {
        setTransactions(state, data) {
            state.transactions = data
        },
        setPage(state, data) {
            state.page = Number(data)
        },
        setDateFrom(state, data) {
            state.dateFrom = data
        },
        setDateTo(state, data) {
            state.dateTo = data
        },
        setTypeId(state, data) {
            state.typeId = data
        },
        setExpenseId(state, data) {
            state.expenseId = data
        },
        setIncomeId(state, data) {
            state.incomeId = data
        },
        setWalletId(state, data) {
            state.walletId = data
        },
        setErrorStatus(state, data) {
            state.errorStatus = data
        },
        setErrorInfo(state, data) {
            state.errorInfo = data
        },
        setLoaded(state, data) {
            state.loaded = data
        },
        setTotal(state, data) {
            state.total = Number(data)
        },
    },
    state: {
        transactions: null,
        errorStatus: false,
        errorInfo: 'Не предопределенное сообщение об ошибке ...',
        loaded: false,
        page: 1,
        dateFrom: '',
        dateTo: '',
        expenseId: '',
        incomeId: '',
        walletId: '',
        typeId: '',

        total: 1,
    },
    getters: {
        getTransactions(state) {
            return state.transactions
        },
        getErrorStatus(state) {
            return state.errorStatus
        },
        getErrorInfo(state) {
            return state.errorInfo
        },
        getLoaded(state) {
            return state.loaded
        },
        getDateFrom(state) {
            return state.dateFrom
        },
        getDateTo(state) {
            return state.dateTo
        },
        getPage(state) {
            return state.page
        },
        getTypeId(state) {
            return state.typeId
        },
        getExpenseId(state) {
            return state.expenseId
        },
        getIncomeId(state) {
            return state.incomeId
        },
        getWalletId(state) {
            return state.walletId
        },
        getTotal(state) {
            return Number(state.total)
        }
    }
}
