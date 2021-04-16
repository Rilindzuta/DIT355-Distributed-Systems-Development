<template>
  <div>
    <Map v-if="!calendarState" @clicked="onEvent"/>
    <calendar v-if="calendarState" @clicked="timeSelected" @return="onMapBack"/>
  </div>
</template>

<script>
import Map from '../components/Map'
import Calendar from '../components/Calendar'
import {mapGetters} from "vuex";
export default {
  name: "home",
  components: {Map, Calendar},
  data() {
    return {
      calendarState: false,
      appointmentRequest: {
        requestid: null,
        userid: null,
        dentistid: null,
        issuance: null,
        time: null
      }
    }
  },
  methods: {

    //Functionality for returning to the map from the calendar with button.
    onMapBack() {
      this.calendarState = !this.calendarState;
    },

    //This event triggers when a user enters the calendar 
    onEvent (event) {
      const time = this.$store.state.date; //This changed from Date.now to VueX store date
      this.calendarState = !this.calendarState;
      // const time = "2020-12-24 12:00"; // using fixed time as I'm doing this on a weekend
      // and that means that there won't be any available appointments by definition since
      // it's closed and there's currently no way to select what date you actually want.
      this.appointmentRequest.dentistid = event;
      // Not pretty but I haven't got time.
      // It gets an array containing all available times for appointments, this should probably be filtered as it can .
      this.$mqtt.publish("circuitbreaker/"+this.getUUID+"/times", '{"dentistid":'+event+',"time":"'+time+'"}');
    },

    //This event triggers when a users books an appointment
    timeSelected (event) {
      // TODO: The date, userid and requestid should not be like this.
      this.calendarState = !this.calendarState;
      const time = event;
      const date = this.$store.state.date.split(" ") //The vuex store contains the current date + 00:00, we split it to only get the date
      this.appointmentRequest.requestid = Math.floor(Math.random()*1000);
      this.appointmentRequest.userid = Math.floor(Math.random()*1000);
      this.appointmentRequest.issuance = Date.now();
      this.appointmentRequest.time = date[0]+" "+time; //Use the first entry in the date array since it contains only the date and not 00:00
      this.$mqtt.publish("circuitbreaker/"+this.getUUID+"/appointment/create", JSON.stringify(this.appointmentRequest));
    }

  },
  computed: { ...mapGetters(['getUUID', 'getAppointment']) }
}
</script>

<style scoped>

</style>