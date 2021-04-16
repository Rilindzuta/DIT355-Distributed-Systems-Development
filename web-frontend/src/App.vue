<template>
  <div id="app">
    <div id="banner"> Dentistimo </div>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: "app",
  data() {
    return {
    }
  },
  created() {
    this.$store.commit('updateUUID', Math.floor(Math.random()*100000))
    this.subscribe();
    this.setFirstDate();
    this.retrieveDentist();
  },
  methods: {
    subscribe(){
      this.$mqtt.subscribe("frontend/"+this.getUUID+"/#", (error, granted) => {
        if(error){
          console.log("Subscription failed")
        } else {
          console.log("Subscription granted" + granted)
        }
      })

      this.$mqtt.on('message', (topic, payload) => {
        const splitTopic = topic.split('/');
        const document = splitTopic[2];
        try {
          payload = JSON.parse(payload.toString());
        } catch (e) {
          payload = {}
        }
        if (document === 'dentist') {
          this.$store.commit('updateDentists', payload);
        } else if (document === 'times') {
          this.$store.commit('updateTimes', payload);
        } else if (document === 'appointment') {
          this.$store.commit('updateAppointment', payload);
        } else if (document === 'rejected') {
          alert("En error has occured! " + "\n" + payload);
        }
      })
    },
    setFirstDate(){
      var dateArray = new Date(Date.now()).toISOString().split(".")
      var date = dateArray[0].replace("T", " ")
      var correctDate = date.split(" ")
      var finalDate = correctDate[0] + " 00:00"
      this.$store.commit("updateDate", finalDate)
    },
    retrieveDentist() {
      const obj = {
        time: this.$store.state.date
      }
      this.$mqtt.publish("circuitbreaker/"+this.getUUID+"/dentist/read", JSON.stringify(obj));
    }
  },
  computed: {...mapGetters(['getUUID'])}
}
</script>

<style>

#app {
  font-family: 'Libre Franklin', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: url(../src/assets/bg.jpg) no-repeat center center fixed;
  background-size: cover;
  height: 100%;

}

#banner {
  height: 120px;
  width: auto;
  font-size: 90px;
  color: rgba(0, 0, 0, 0.418);
  background-color: rgba(194, 243, 255, 0.644);
}

</style>