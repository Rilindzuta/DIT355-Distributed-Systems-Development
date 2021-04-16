<template>
  <div class="container">
    <b-button @click="onReturn()" id="backButton">Back</b-button>
    Showing dates for: {{this.showDate}} <br>
    <div class="row">
      <div class="col-lg-4 col-sm-6" v-for="(time, index) in getTimes" :key="index">
        <b-button size="lg" id="timeButton" @click="onClick(time.start)">From: {{time.start}} <br> To: {{time.end}}</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'calendar',
  data(){
    return {
      showDate: this.getDate()
    }
  },
  computed: {...mapGetters(['getTimes'])},
  methods: {

    getDate(){
      var dateSelected = this.$store.state.date
      var showDate = dateSelected.split(" ")
      return showDate[0]
    },

    onClick(event) {
      this.$emit('clicked', event)
    },
    
    onReturn(){
    this.$emit('return')
    }
  }
};
</script>

<style>

body {
  background-color: white;
}

#timeButton {
  background: rgb(139, 139, 255);
  border: 2px solid black;
  margin:5px;
}

#timeButton:hover {
  background: blue;
}

#backButton {
  position:absolute;
  left: 0;
  margin: 20px 0px 0px 20px;
  background: white;
  color: rgba(0, 0, 0, 0.596);
  font-size: 25px;
  border-color: black;
  border-width: 2px;
}

#backButton:hover {
  background: rgb(201, 201, 201);
}

</style>