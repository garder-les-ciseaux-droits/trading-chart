<template>
  <main>
    <section class="w-screen h-screen flex justify-center items-center bg-[url('/Users/evanvosh/Documents/Portfolio/TradingView/trading-chart/src/assets/background.jpg')] bg-cover bg-center min-w-0 max-w-[1440px] max-h-[900]">
      <div class="relative w-[1440px] overflow-hidden h-full flex flex-col items-center justify-center bg-[url('/Users/evanvosh/Documents/Portfolio/TradingView/trading-chart/src/assets/background.jpg')] bg-cover bg-center min-w-0">
        <div class="w-full h-full absolute bg-black opacity-70"></div>
        <div class="w-full h-[40px] opacity-100 absolute top-0  flex">
          <div class="w-[70px] h-full flex items-center pl-2" v-for="ohlc in ohlcData" :key="ohlc.id">
            <span class="text-white">{{ ohlc }}</span>
          </div>
        </div>
        <div id="tvchart" class="flex w-full absolute z-0 justify-center items-center h-full min-w-0"></div>
      </div>
    </section>
  </main>
</template>

<script>
import { createChart, CrosshairMode} from 'lightweight-charts';
import { ichimokuCloud } from 'indicatorts';
import axios from 'axios';

export default {
  data() {
    return {
      cdata: null,
      ichimokuCloudLine: {tenkanLine: null, kijunLine: null, ssaLine: null, chikouLine: null,ssaLine: null, ssbLine:null},
      intervalId: null,

      ohlcData: null,
      fillData: null,
      ssaData: null,
      ssbData: null,
    };
  },
  mounted() {
    const domElement = document.getElementById('tvchart');
    const chartProperties = {
        width: domElement.offsetWidth,
        height: (domElement.offsetHeight - '100'),
        timeScale: {
          timeVisible: true,
          secondsVisible: false
        },
        layout: {
          textColor: 'white',
          background: {
            type: 'solid',
            color: 'rgba(255, 255, 255, 0)'
          }
        },
        grid: {
          vertLines: {
            color: 'rgba(255, 255, 255, 0.1)',
            style: 2
          },
          horzLines: {
            color: 'rgba(255, 255, 255, 0)',
            style: 2
          }
        },
    };
    this.chart = createChart(domElement, chartProperties);
    this.lineSeries = this.chart.addCandlestickSeries();
    this.tenkanSen = this.chart.addLineSeries({ lastValueVisible: true, color: 'rgb(255, 0, 0)', priceLineVisible: true });
    this.kijunSen = this.chart.addLineSeries({ lastValueVisible: true, color: 'rgb(0, 0, 204)', priceLineVisible: true });
    this.chikouSpan = this.chart.addLineSeries({ lastValueVisible: true, color: 'rgb(102, 204, 0)', priceLineVisible: true });
    this.senkouA = this.chart.addLineSeries({ lastValueVisible: true, color: 'rgb(153, 255, 153)', priceLineVisible: true });
    this.senkouB = this.chart.addLineSeries({ lastValueVisible: true, color: 'rgb(255, 153, 153)', priceLineVisible: true });
    this.seriesB = this.chart.addLineSeries({ lastValueVisible: true, color: 'red', lineWidth: 3 });
    this.fillSeries = this.chart.addCandlestickSeries({
        upColor: 'rgba(255, 100, 100, 0.2)',
        downColor: 'rgba(100, 255, 100, 0.2)',
        wickVisible: false,
        borderVisible: false,
    });

    this.chart.applyOptions({
        crosshair: {
          mode: CrosshairMode.Normal,
        }
      });

    this.chart.subscribeCrosshairMove(param => {
        if (param.time) this.ohlcData = param.seriesData.get(this.lineSeries);
    });

    this.fetchData();

    this.intervalId = setInterval(() => this.fetchData(), 60000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  methods: {
    updateChart() {
      
      this.lineSeries.setData(this.cdata); 
      this.tenkanSen.setData(this.ichimokuCloudLine.tenkanLine);
      this.kijunSen.setData(this.ichimokuCloudLine.kijunLine);
      this.chikouSpan.setData(this.ichimokuCloudLine.chikouLine);
      this.senkouA.setData(this.ichimokuCloudLine.ssaLine);
      this.senkouB.setData(this.ichimokuCloudLine.ssbLine);
      this.seriesB.setData(this.ssbData);
      this.fillSeries.setData(this.fillData);
    },
    fetchData() {
      axios.get('https://api.kraken.com/0/public/OHLC?pair=BTCUSD&interval=5')
      .then(response => {this.processData(response.data.result.XXBTZUSD); this.updateChart();});
    },
    processData(data) {
      const defaultConfig = { short: 9, medium: 26, long: 52, close: 26 };
      this.cdata = data.map(d => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));
      

     this.ichimokuCloudLine.tenkanLine = data.map(d => ({time: d[0]}));
     this.ichimokuCloudLine.kijunLine = data.map(d => ({time: d[0]}));
     this.ichimokuCloudLine.ssaLine = data.map(d => ({time: d[0]}));
     this.ichimokuCloudLine.ssbLine = data.map(d => ({time: d[0]}));

     let timeStep = this.ichimokuCloudLine.ssaLine[1].time - this.ichimokuCloudLine.ssaLine[0].time;
     let lastTime = this.ichimokuCloudLine.ssaLine[this.ichimokuCloudLine.ssaLine.length - 1].time;

     for (let i = 1; i <= 26; i++) {
        this.ichimokuCloudLine.ssaLine.push({time: lastTime + i * timeStep});
        this.ichimokuCloudLine.ssbLine.push({time: lastTime + i * timeStep});
      };
      
     this.ichimokuCloudLine.chikouLine = data.map(d => ({time: d[0]}))
      // Вычисление Ichimoku Cloud
      const highs = this.cdata.map(d => d.high);
      const lows = this.cdata.map(d => d.low);
      const closes = this.cdata.map(d => d.close);
      const { tenkan, kijun, ssa, ssb, leadingSpan, laggingSpan } = ichimokuCloud(highs, lows, closes, defaultConfig);

      for(let i = 0; i < this.ichimokuCloudLine.tenkanLine.length; i++){
        for(let i = 0; i < tenkan.length; i++){
          this.ichimokuCloudLine.tenkanLine[i].value = tenkan[i];
        }
      }
      for(let i = 0; i < this.ichimokuCloudLine.kijunLine.length; i++){
        for(let i = 0; i < kijun.length; i++){
          this.ichimokuCloudLine.kijunLine[i].value = kijun[i];
        }
      }
      for(let i = 0; i < this.ichimokuCloudLine.chikouLine.length; i++){
        for(let i = 0; i < laggingSpan.length; i++ ){
          this.ichimokuCloudLine.chikouLine[i].value = laggingSpan[i];
        }
      }
      this.ichimokuCloudLine.chikouLine.splice(this.ichimokuCloudLine.chikouLine.length - 26, 26);

      for(let i = 0; i < this.ichimokuCloudLine.ssaLine.length; i++){
        for(let i = 0; i < ssa.length; i++) this.ichimokuCloudLine.ssaLine[i].value = ssa[i];
      }
      for(let i = 0; i < this.ichimokuCloudLine.ssbLine.length; i++){
        for(let i = 0; i < ssb.length; i++) this.ichimokuCloudLine.ssbLine[i].value = ssb[i];
      }
      this.ichimokuCloudLine.tenkanLine.splice(0, 9);
      this.ichimokuCloudLine.kijunLine.splice(0,26);

      this.ssaData = this.ichimokuCloudLine.ssaLine.map((point) => ({
        time: point.time,
        value: point.value,
        }));

      this.ssbData = this.ichimokuCloudLine.ssbLine.map((point) => ({
        time: point.time,
        value: point.value,
      }));

      this.fillData = this.ichimokuCloudLine.ssaLine.map((point, index) => ({
        time: point.time,
        open: point.value,
        high: point.value,
        close: this.ichimokuCloudLine.ssbLine[index]?.value || point.value,
        low: this.ichimokuCloudLine.ssbLine[index]?.value || point.value,
      }));
    }, 

    charting() {
      const domElement = document.getElementById('tvchart');
      const chartProperties = {
        width: domElement.offsetWidth,
        height: (domElement.offsetHeight - '100'),
        timeScale: {
          timeVisible: true,
          secondsVisible: false
        },
        layout: {
          textColor: 'white',
          background: {
            type: 'solid',
            color: 'rgba(255, 255, 255, 0)'
          }
        },
        grid: {
          vertLines: {
            color: 'rgba(255, 255, 255, 0.1)',
            style: 2
          },
          horzLines: {
            color: 'rgba(255, 255, 255, 0)',
            style: 2
          }
        },

        
      };
      const chart = createChart(domElement, chartProperties);
      const candleSeries = chart.addCandlestickSeries();

      // ICHIMOKU SETUP
      const chikou = chart.addLineSeries();
      chikou.setData(this.ichimokuCloudLine.chikouLine)

      const tenkan = chart.addLineSeries();
      tenkan.setData(this.ichimokuCloudLine.tenkanLine)

      const kijun = chart.addLineSeries();
      kijun.setData(this.ichimokuCloudLine.kijunLine)

      const ssa = chart.addLineSeries();
      ssa.setData(this.ichimokuCloudLine.ssaLine)

      const ssb = chart.addLineSeries();
      ssb.setData(this.ichimokuCloudLine.ssbLine)

      candleSeries.setData(this.cdata);

      const seriesB = chart.addLineSeries({
        color: 'red',
        lineWidth: 3,
      });

      const fillSeries = chart.addCandlestickSeries({
        upColor: 'rgba(255, 100, 100, 0.2)',
        downColor: 'rgba(100, 255, 100, 0.2)',
        wickVisible: false,
        borderVisible: false,
      });

      this.ssaData = this.ichimokuCloudLine.ssaLine.map((point) => ({
        time: point.time,
        value: point.value,
      }));

      this.ssbData = this.ichimokuCloudLine.ssbLine.map((point) => ({
        time: point.time,
        value: point.value,
      }));

      const fillData = this.ichimokuCloudLine.ssaLine.map((point, index) => ({
        time: point.time,
        open: point.value,
        high: point.value,
        close: this.ichimokuCloudLine.ssbLine[index]?.value || point.value,
        low: this.ichimokuCloudLine.ssbLine[index]?.value || point.value,
      }));

      seriesB.setData(this.ssbData);
      fillSeries.setData(fillData);
      //
      tenkan.applyOptions({
        color: 'rgb(255, 0, 0)',
        priceLineVisible: true,
        lastValueVisible: true
      })
      kijun.applyOptions({
        color: 'rgb(0, 0, 204)',          
        priceLineVisible: true,
        lastValueVisible: true
      })
      chikou.applyOptions({
        color: 'rgb(102, 204, 0)',
        priceLineVisible: true,
        lastValueVisible: true
      })
      ssa.applyOptions({
        color: 'rgb(153, 255, 153)',
        priceLineVisible: true,
        lastValueVisible: true
      })
      ssb.applyOptions({
        color: 'rgb(255, 153, 153)',
        priceLineVisible: true,
        lastValueVisible: true,
      
      })

      chart.applyOptions({
        crosshair:{
          mode: CrosshairMode.Normal,
        }
      })
      chart.subscribeCrosshairMove(param => {
        if (param.time) this.ohlcData = param.seriesData.get(candleSeries)
        })
      
    }
  }
  
};
</script>

<style>

</style>
