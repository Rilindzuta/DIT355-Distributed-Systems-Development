import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({

    state: {
        uuid: null,
        dentists: [],
        times: [],
        appointment: null,
        date: ''

    },
    getters: {
        getDentists(state) {
            return state.dentists
        },
        getUUID(state) {
            return state.uuid;
        },
        getTimes(state) {
            return state.times;
        },
        getAppointment(state) {
            return state.appointment;
        },
        getDate(state) {
            return state.date;
        }
    },

    mutations: {
        updateDentists(state, dentists) {
            state.dentists = dentists;
        },
        updateUUID(state, uuid) {
            state.uuid = uuid;
        },
        updateTimes(state, times) {
            state.times = times;
        },
        updateAppointment(state, appointment) {
            state.appointment = appointment;
        },
        updateDate(state, date) {
            state.date = date;
        }
    }
})
