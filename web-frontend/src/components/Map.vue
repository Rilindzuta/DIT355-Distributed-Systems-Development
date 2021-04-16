<template>
  <div> 
    <div id="map"> Dentists in Gothenburg
      <b-form-select id="dateDrop" v-model="selectedDate" @change="changeDate(selectedDate)" :options="days"></b-form-select>
      <l-map id="mapBox"
        v-if="showMap"
        :zoom="zoom"
        :center="coordinates"
        :options="mapOptions"
        style="height: 80%"
        @update:center="centerUpdate"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="dentist in getDentists"
          :lat-lng="[dentist.coordinate.latitude, dentist.coordinate.longitude]"
          :key="dentist.id"
          @click="innerClick(dentist.id)"
          :icon="getIcon(dentist.flag)"
        />
      </l-map>
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { latLng, icon } from "leaflet";
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import { mapGetters } from "vuex";
export default {
  name: "Example",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      //The coming 5 days, including the current day.
      days: [
        moment().format('LL'), //Today
        moment().add(1,'d').format('LL'), //Tomorrow
        moment().add(2,'d').format('LL'), //Day after tomorrow
        moment().add(3,'d').format('LL'), //Etc
        moment().add(4,'d').format('LL')  //Etc
        ],
      dentists: [],
      coordinates: {
        lat: 0,
        lng: 0,
      },
      zoom: 13,
      center: latLng(57.7, 11.95),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      newPopup: latLng(500, 500),
      currentZoom: 13,
      currentCenter: latLng(57.7, 11.95),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      //Icons to display pins depending on available times.
      //Used green and red pins, imported from the url.(Github user - pointhi)
      greenIcon: icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        iconSize:[30,40],
        iconAnchor:[15,30]
      }),
      redIcon: icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize:[30,40],
        iconAnchor:[15,30]
      }),
      selectedDate: ''
    };
  },
  created() {
    this.coordinates = { lat: 57.7, lng: 11.95 };
    this.dentists = this.getDentists;
  },
  computed: { ...mapGetters(["getDentists"]) },
  methods: {
    changeDate(date){
      var dateArray = ''

    if(date === this.days[0]){
      dateArray = moment().toISOString().split(".")
    }else if(date === this.days[1]){
      dateArray = moment().add(1,'d').toISOString().split(".")
    }else if(date === this.days[2]){
      dateArray = moment().add(2,'d').toISOString().split(".")
    }else if(date === this.days[3]){
      dateArray = moment().add(3,'d').toISOString().split(".")
    }else if(date === this.days[4]){
      dateArray = moment().add(4,'d').toISOString().split(".")
    }

    var nextDate = dateArray[0].replace("T", " ")
    var correctDate = nextDate.split(" ")
    var finalDate = correctDate[0] + " 00:00"
    this.$store.commit("updateDate", finalDate)
    this.updateMap()
    },

    updateMap() {
      const obj = {
        time: this.$store.state.date
      }
      this.$mqtt.publish("circuitbreaker/"+this.$store.state.uuid+"/dentist/read", JSON.stringify(obj));
    },
    getIcon(flag) {
      if (flag == true) {
        return this.greenIcon
      }else{
        return this.redIcon
      }
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    addPin() {
      this.newPopup = this.currentCenter;
    },
    innerClick(event) {
      this.$emit("clicked", event);
    },
  },
};
</script>

<style scoped>
#map {
  height: 80vh;
  width: 100vh;
  margin: auto;
}

#dateDrop {
  background: white;
  color: rgba(0, 0, 0, 0.596);
  font-size: 25px;
  border-color: black;
  border-width: 2px;
}

#mapBox {
  border: 2px solid black;
}
</style>
