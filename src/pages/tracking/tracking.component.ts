import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from "@angular/core";
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {AppShipmentService} from "../../app/services/appShipment.service";
import {RateService} from "../rateService/rateService.compoment";
import {GoogleMapServices} from "../../app/services/googleMap.services";

declare let google;

@Component({
  templateUrl: 'tracking.html',
})
export class Tracking implements OnInit{

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markerOrigen: any;
  markerDestino: any;
  markerTrans: any;
  directionsService: any;
  directionsRender: any;
  directionsResult: any;
  directionsStatus: any;
  iconUserDetailFrom:any;
  iconUserDetailTo:any;
  iconTransDetail:any;
  iconTrans:any;
  data:any;
  user:any;
  activeService:any;
  locations:any;
  serviceTask:any;
  addresses:any;

  info:any;

  constructor(public navCtrl: NavController, private appShipmentService:AppShipmentService, private alertCtrl: AlertController,
              private navParams:NavParams, private changeDetection: ChangeDetectorRef, private googleMapServices:GoogleMapServices) {
    this.markerTrans;
    this.markerOrigen = null;
    this.iconUserDetailFrom = {url: '../assets/icon/userPos.png'};
    this.iconUserDetailTo = {url: '../assets/icon/userPos2.png'};
    this.iconTransDetail = {url: '../assets/icon/carPos.png'};
    this.iconTrans = {url: '/assets/icon/car.png'};
    this.user = navParams.get('user');
    this.activeService = navParams.get('activeService');
    this.addresses = {origen:{}, destino:{}};
    console.log(this.activeService);
    this.serviceTask = setInterval(()=>{
      this.updateServiceData();
    },5000);

  }

  ngOnInit(){
    this.loadMap();
  }

  loadMap(){

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRender = new google.maps.DirectionsRenderer();
    let centerMap = new google.maps.LatLng(this.activeService.origen.lat, this.activeService.origen.lng);
    let mapOptions = {
      center: centerMap,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    let origenPos = new google.maps.LatLng(this.activeService.origen.lat, this.activeService.origen.lng);
    let destinoPos = new google.maps.LatLng(this.activeService.destino.lat, this.activeService.destino.lng);
    let transPos = new google.maps.LatLng(this.activeService.transporter.pos.lat, this.activeService.transporter.pos.lng);
    this.addMarkerWithPos(1, origenPos);
    this.addMarkerWithPos(2, destinoPos);
    this.loadTransMarker(transPos);
  };

  addMarkerCenterMap(opt){
    if( opt === 1 ){
      if(this.markerOrigen){
        this.markerOrigen.setMap(null);
      }
      this.markerOrigen = this.putMarker(this.map, this.markerOrigen, this.map.getCenter(), this.iconUserDetailFrom);
    }
    if( opt === 2 ){
      if(this.markerDestino){
        this.markerDestino.setMap(null);
      }
      this.markerDestino = this.putMarker(this.map, this.markerDestino, this.map.getCenter(), this.iconUserDetailTo);
    }
  }

  addMarkerWithPos(opt, pos){

    if( opt === 1 ){
      if(this.markerOrigen){
        this.markerOrigen.setMap(null);
      }
      this.markerOrigen = this.putMarker(this.map, this.markerOrigen, pos, this.iconUserDetailFrom);
    }
    if( opt === 2 ){
      if(this.markerDestino){
        this.markerDestino.setMap(null);
      }
      this.markerDestino = this.putMarker(this.map, this.markerDestino, pos, this.iconUserDetailTo);
    }
  };

  putMarker(map, marker, pos, iconDetail, data?){
    this.directionsRender.set('directions', null);
    marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: pos,
      icon: iconDetail,
      data: data
    });
    return marker;
  }

  loadTransMarker(pos){
    this.markerTrans = this.putMarker(this.map, this.markerTrans, pos, this.iconTransDetail);
  }

  getDirections(){
    console.log("getting directions!");
    let request = {
      origin:this.markerOrigen.position,
      destination:this.markerDestino.position,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status)=>{
      this.directionsResult = response;
      this.directionsStatus = status;
      this.printDirections()
    });
  };

  goRateService(){
    this.navCtrl.setRoot(RateService, {user:this.user, activeService:this.activeService});
  }

  printDirections(){
    if (this.directionsStatus === "OK"){
      this.markerOrigen.setMap(null);
      this.directionsRender.setMap(this.map);
      this.directionsRender.setDirections(this.directionsResult);
    }
    else {
      alert("Cant retrieve routes");
    }
  };

  updateServiceData(){
    this.addresses.origen = this.activeService.origen;
    this.addresses.destino = this.activeService.destino;
    this.appShipmentService.getServiceById(this.activeService).subscribe(
      (response)=>{
        this.activeService = response[0];
        this.updateServiceAddresses();
        this.updateTransporterMarker();
        console.log(this.activeService);
        if (this.activeService.status === "ST"){
          this.getDirections();
        }
        if (this.activeService.status === "FI"){
          clearInterval(this.serviceTask);
          this.goRateService();
        }

      }
    );
  }

  updateServiceAddresses(){
    this.activeService.origen = this.addresses.origen;
    this.activeService.destino = this.addresses.destino;
  }

  getTransporterPos(){
    this.appShipmentService.getTransporterById({id:this.activeService.transporter.id}).subscribe(
      (response) => {
        this.activeService.transporter = response;
        console.log(this.activeService);
        this.updateTransporterMarker();
      }
    );
  }

  updateTransporterMarker(){
    let pos = new google.maps.LatLng(this.activeService.transporter.pos.lat, this.activeService.transporter.pos.lng);
    this.markerTrans.setPosition(pos);
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Cuidado!',
      subTitle: 'Por favor, revise el estado de su paquete a la llegada, hemos detectado movimeintos bruscos durante el servicio que puedan haberlo comprometido.',
      buttons: ['OK']
    });
    alert.present();
  }
}
