function rock(ele){
  //单个数据动态数据可视化折线图(恒博可视乎方案)
  this.Visual = function(method, parameters){
    var self = this;
    this.init = function(info){
      // this.data = [];
      // self = this;
      // if(self.myChart){
      //   return;
      // }
      self.data = [];
      $(ele).css({
        "width":info.width,
        "height":info.height,
      });
      // var data=[];
      self.myChart = echarts.init($(ele)[0]);
      // console.log($(ele)[0]);
      // console.log(self.myChart);
      self.min = -120;
      self.max = 0;
      // var data = [[0,8], [-10,10], [-20,12], [-30,18], [-40,22], [-50,29], [-60,27], [-70,20], [-80,18]];
      // console.log(info);
      // console.log("f");
      for(var j=0;j<6;j++){
        self.data[j] = [(self.min+j*info.density/1000),Math.round(Math.random()*60)];
      }
      $.ajax({
        url:info.url,
        method:"post",
        dataType:"json",
        async:false,
        data:{
          rid:info.rid,
          type:info.type,
          period:info.period,
          density:info.density/1000
        },
        success:function(resp)
        {
          // console.log("***");
          // console.log(info["type"]);
          self.data = [];
          for(var j=0;j<resp[info["type"][0]].length;j++)
          {
            // self.data.push([(self.min+j*info.density/1000),resp[info["type"][0]][j]]);
            var val = new Number(resp[info["type"][0]][j]);
            self.data[j] = [(self.min+j*info.density/1000),val.toFixed(2)];
          }
          console.log(self.data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
           console.log(XMLHttpRequest.status);
           console.log(XMLHttpRequest.readyState);
           console.log(textStatus);
          },
      });

      self.option = {
          // legend: {
          //     data:['高度(km)与气温(°C)变化关系']
          // },
          tooltip: {
              trigger: 'axis',
              formatter: "{c0}",
              backgroundColor: "rgba(0,0,0,0)",
              fontFamily:"AdobeHeitiStd-Regular",
          },
          grid: {
            // show:true,
              left: '5%',
              right: '5%',
              bottom: '5%',
              containLabel: true
          },
          yAxis: {
              type: 'value',
              show: false,
              axisLabel: {
                  formatter: '{value} °C'
              },
              splitLine:{show: false},
              axisTick: {
                show: false
              }
          },
          xAxis: {
              type: 'value',
              // show:true,
              axisLine: {
                onZero: false,
                lineStyle:{
                  color: '#ada9a9',
                  type:'dotted',
                },
              },
              axisLabel: {
                  formatter: '{value} ',
              },
              axisPointer:{
                type:"line",
                lineStyle:{
                  color: {
                    type: 'linear',
                    x: 1,
                    y: 1,
                    x2: 0.5,
                    y2: 0.5,
                    colorStops: [{
                        offset: 0, color: "rgba(66, 209, 254, 0.88)" // 0% 处的颜色
                    }, {
                        offset: 1, color: 'rgba(203, 203, 203, 0.0)' // 100% 处的颜色
                    }],
                    globalCoord: false // 缺省为 false
                  }
                }
              },

              splitLine:{show: false},
              boundaryGap: false,
              min:self.min,
              max:self.max,

          },
          series: [
              {
                  // name: '高度(km)与气温(°C)变化关系',
                  type: 'line',
                  smooth: true,
                  // showSymbol:false,
                  itemStyle: {

                      normal: {
                          borderColor:"rgba(68, 187, 246, 0.69)",
                          borderWidth:1.46,
                          color: '#d9d9d9',
                          // borderColor: 'rgba(255,0,0)',
                          shadowColor: 'rgba(68, 187, 246, 0.89)',
                          shadowBlur: 20,

                          // shadowOffsetY: 200,
                      }
                  },

                  data:self.data,
              }
          ],

          visualMap: {
            type: 'continuous',
            dimension:0,
            // 不显示 visualMap 组件，只用于明暗度的映射
            show: false,
            // 映射的最小值为 80
            min: self.min,
            // 映射的最大值为 600
            max: self.max,
            inRange: {
                // 明暗度的范围是 0 到 1
                colorAlpha: [0, 1]
            }
        },
        backgroundColor: "rgba(0, 0, 0, 0)",
        blendMode: 'lighter',
      };
      self.myChart.setOption(self.option);

    }//end of init
    this.update = function(info){
      var des_in_sec = info.density/1000;
      self.request = setInterval(function(){
          self.max +=des_in_sec;
          self.min +=des_in_sec;
          $.ajax({
            url:info.url,
            method:"post",
            dataType:"json",
            async:false,
            data:{
              rid:info.rid,
              type:info.type,
              period:info.period,
              density:des_in_sec
            },
            success:function(resp)
            {

              console.log(self.data);
              var val = new Number(resp[info["type"][0]][0]);
              self.data.push([(self.data[self.data.length-1][0]+des_in_sec),val.toFixed(2)]);
              // }
              // console.log(self.data);
              self.myChart.setOption({
                  xAxis: {
                      min:self.min,
                      max:self.max,
                  },
                  series: [{
                      data: self.data
                  }],
                  visualMap:{
                    max:self.max,
                    min:self.min
                  }
              });
            },
            error:function(resp){
              console.log(false);
            }
          });
          // self.myChart.setOption({
          //     xAxis: {
          //         min:self.min,
          //         max:self.max,
          //     },
          //     series: [{
          //         data: self.data
          //     }],
          //     visualMap:{
          //       max:self.max,
          //       min:self.min
          //     }
          // });
        },info.density);
    }
    this.stop = function(info){
      window.clearInterval(self.request);
      delete self.myChart;
      delete self.min;
      delete self.max;
      delete self.data;
      delete self.myChart;
      delete self.option;
      $(ele).after("<div class='chart' id='visual-chart'></div>");
      $(ele).remove();
    },
    this.methods = {
      "create":this.init,
      "update":this.update,
      "stop":this.stop
    };
    this.methods[method](parameters);
  }//end of visual
  //Controller
  this.Controller = function(method, parameters){
    var stat,X,Y,X0,Y0,R,r,w=0,v=0,button,self;
    button = ele+" .controller-button";
    self = this;
    this.init = function(info){
      //set controller's container.
      self.chart_active = false;
      $(ele).css({
        "width":2*info.radius,
        "height":2*info.radius,
        "border-radius":info.radius+"px",
        "border":"4px solid #4989d7",
        "background-color":"rgba(14, 108, 162, 0.42)",
        "box-shadow": "0px 0px 6px 3px rgba(25, 118, 164, 0.52)",
        "position":"relative"
      });
      $(ele).append("<div class='controller-button'></div>");
      $(button).css({
        "width":2*info.bradius,
        "height":2*info.bradius,
        "border-radius":info.bradius,
        "border":"4px solid #46a9cd",
        "background-color":"rgba(64, 141, 204, 0.19)",
        "box-shadow": "3px 3px 6px 3px rgba(25, 118, 164, 0.52),2px 2px 4px 2px rgba(25, 118, 164, 0.52) inset",
        "position" : "absolute",
        "left":"50%",
        "top":"50%",
        "transform":"translate(-50%, -50%)",
        "cursor":"pointer"
      });

    }
    this.active = function(info){
      X0 = $(button).offset().left;
      Y0 = $(button).offset().top;
      X,Y,R,r;
      stat = false;
      R = 100;
      r = 25;
      w = 0;
      v = 0;
      $(button).mousedown(function(event){
        if(stat == false)
        {
          X = event.pageX;
          Y = event.pageY;
          $(button).offset({"left":X-r,"top":Y-r});
          // var tmpx,tmpy;
          // tmpx = eval($(button).css("left").slice(0,-2));
          // tmpy = eval($(button).css("top").slice(0,-2));
          // $(button).css({"left":tmpx+X-X0,"top":tmpy+Y-Y0});
          stat = true;
          movingHttp = setInterval(function(){
            if(self.chart_active){
              if(Math.abs(w)<=0.20){
                w = 0;
              }
              if(typeof(self.option) != "undefined"){
                self.option.series[0].data[0].value = Math.round(v/R*100);
                self.option.series[1].data[0].value = Math.round(w*100);
                // console.log(self.option.series[0].data[0].value);
                // console.log(true);
                // self.option.series[2].data[0].value = (Math.random()*2).toFixed(2) - 0;
                // self.option.series[3].data[0].value = (Math.random()*2).toFixed(2) - 0;
                self.myChart.setOption(self.option);
              }

            }
            if(stat == true)
            {
              $.ajax({
                url:info.url,
                method:"post",
                dataType:"json",
                data:{
                  rid:info.rid,
                  angleSpeed:Math.round(w*100)%100,//Math.PI
                  lineSpeed:Math.round(v/R*100)%100
                },
                success:function(resp){
                  console.log(resp);
                },
                error:function(resp){
                  console.log(resp);
                },
                complate:function(resp){
                  console.log(resp);
                }
              });//end of ajax
            }
          },info.density);
        }
      });
      $(window).mousemove(function(event){
        if(stat == true)
        {
          var newX,newY,D,delX,delY,ox,oy,posX,posY,v_;
          newX = event.pageX;
          newY = event.pageY;

            delX = (newX-X);
            delY = (newY-Y);
            ox = eval($(button).css("left").slice(0,-2));
            oy = eval($(button).css("top").slice(0,-2));

            posX = $(button).offset().left - X0;
            posY = Y0 - $(button).offset().top;
            v_ = Math.sqrt((posX*posX)+(posY*posY))
            w = v_==0?0:posX / v_;
            if(posX!=0&&posY!=0){
              w = posX*posY/Math.abs(posX*posY)*Math.abs(posX/v_);
            }
            else{
              w = 0;
            }
            w = -w;
            v = posY;
            $(button).css({"left":ox+delX,"top":oy+delY});

          X = newX;
          Y = newY;
        }
      });
      $(window).mouseup(
        function(event){
          if(stat == true)
          {
            stat = false;
            console.log("clear");
            $(button).animate({"left":"50%","top":"50%"},100);
            X = X0;
            Y = Y0;
            clearInterval(movingHttp);
            if(typeof(self.option)!="undefined")
            {
              self.option.series[0].data[0].value = 0;
              self.option.series[1].data[0].value = 0;
              self.myChart.setOption(self.option);
            }

          }
        }
      );

      //on mobile
      $(button).on("touchstart",function(event){
        var event_ = event.originalEvent.targetTouches[0];
        if(stat == false)
        {
          X = event_.pageX;
          Y = event_.pageY;
          $(button).offset({"left":X-r,"top":Y-r});
          stat = true;
          movingHttp = setInterval(function(){
            if(self.chart_active){
              if(typeof(self.option) != "undefined"){
                self.option.series[0].data[0].value = Math.round(v/R*100);
                self.option.series[1].data[0].value = Math.round(w*100);
                // console.log(self.option.series[0].data[0].value);
                // console.log(true);
                // self.option.series[2].data[0].value = (Math.random()*2).toFixed(2) - 0;
                // self.option.series[3].data[0].value = (Math.random()*2).toFixed(2) - 0;
                self.myChart.setOption(self.option);
              }

            }
            if(stat == true)
            {

              $.ajax({
                url:info.url,
                method:"post",
                dataType:"json",
                data:{
                  rid:info.rid,
                  angleSpeed:Math.round(w*100)%100,//Math.PI
                  lineSpeed:Math.round(v/R*100)%100
                },
                success:function(resp){
                  console.log(resp);
                }
              });//end of ajax
            }
          },info.density);
        }
      });
      $(ele).on("touchmove",function(event){
        event.preventDefault();
        var event_ = event.originalEvent.targetTouches[0];
        if(stat == true)
        {
          var newX,newY,D,delX,delY,ox,oy,posX,posY,v_;
          newX = event_.pageX;
          newY = event_.pageY;

            delX = (newX-X);
            delY = (newY-Y);
            ox = eval($(button).css("left").slice(0,-2));
            oy = eval($(button).css("top").slice(0,-2));

            posX = $(button).offset().left - X0;
            posY = Y0 - $(button).offset().top;
            v_ = Math.sqrt((posX*posX)+(posY*posY));
            w = v_==0?0:posX / v_;
            if(posX!=0&&posY!=0){
              w = posX*posY/Math.abs(posX*posY)*Math.abs(posX/v_);
            }
            else{
              w = 0;
            }
            w = -w;
            v = posY;
            // console.log(v);
            $(button).css({"left":ox+delX,"top":oy+delY});

          X = newX;
          Y = newY;
        }
      });
      $(window).on("touchend",
        function(event){
          if(stat == true)
          {
            stat = false;
            console.log("clear");
            $(button).animate({"left":"50%","top":"50%"},100);
            X = X0;
            Y = Y0;
            clearInterval(movingHttp);
            if(typeof(self.option) != "undefined"){
              self.option.series[0].data[0].value = 0;
              self.option.series[1].data[0].value = 0;
              self.myChart.setOption(self.option);
            }
          }
        }
      );

    };
    this.createChart = function(info){
      $(info.chart_dom).css({
        "width":info.style.width,
        "height":info.style.height,
        "position":"absolute",
        "left":info.style.left,
        "top":info.style.top
      });
      self.myChart = echarts.init($(info.chart_dom)[0]);
      self.option = {
        backgroundColor: 'rgba(0,0,0,0)',
        tooltip : {
            formatter: "{a} <br/>{c} {b}"
        },
        series : [
            {
                name:'线速度',
                type:'gauge',
                // center : ['75%', '50%'],    // 默认全局居中
                radius : '80px',
                min:-100,
                max:100,
                startAngle:150,
                endAngle:30,
                splitNumber:4,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.2, '#4be7e7'],[0.8, '#1e90ff'],[1, '#f2629f']],
                        width: 2,
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10
                    }
                },
                axisTick: {
                  show:false,         // 坐标轴小标记
                    length :12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto',
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10,
                    }
                },
                axisLabel: {
                    textStyle: {       // 属性lineStyle控制线条样式
                        fontWeight: 'bolder',
                        color: '#a4c1e8',
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10,
                    },
                },
                splitLine: {           // 分隔线
                    length :15,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        width:3,
                        color: '#fff',
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10
                    }
                },
                pointer: {
                    width:2,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 5
                },
                title : {
                  offsetCenter: [0, '-110%'],       // x, y，单位px
                   textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                       fontWeight: 'normal',
                       fontStyle: 'italic',
                       color: '#a4c1e8',
                       shadowColor : '#fff', //默认透明
                       shadowBlur: 10
                   }
                },
                detail : {
                  borderColor: '#fff',
                  shadowColor : '#fff', //默认透明
                  shadowBlur: 5,
                  width: 40,
                  height:20,
                  offsetCenter: [0, '-40%'],       // x, y，单位px
                  textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                      fontWeight: 'normal',
                      color: '#a4c1e8',
                      fontSize: 10
                  },
                },
                data:[{value: 0, name: '线速度(%/s)'}]
            },
            {
                name:'角速度',
                type:'gauge',
                // center : ['75%', '50%'],    // 默认全局居中
                radius : '80px',
                min:-100,
                max:100,
                startAngle:330,
                endAngle:210,
                splitNumber:4,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.2, '#4be7e7'],[0.8, '#1e90ff'],[1, '#f2629f']],
                        width: 2,
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    show: false
                },
                axisLabel: {
                    textStyle: {       // 属性lineStyle控制线条样式
                        fontWeight: 'bolder',
                        color: '#a4c1e8',
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10
                    },
                },
                splitLine: {           // 分隔线
                    length :15,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        width:3,
                        color: '#fff',
                        shadowColor : '#fff', //默认透明
                        shadowBlur: 10
                    }
                },
                pointer: {
                    width:2,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 5
                },
                title : {
                  offsetCenter: [0, '110%'],       // x, y，单位px
                   textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                       fontWeight: 'normal',
                       fontStyle: 'italic',
                       color: '#a4c1e8',
                       shadowColor : '#fff', //默认透明
                       shadowBlur: 10
                   }
                },
                // detail : {
                //     show: false
                // },
                detail : {
                    //  backgroundColor: 'rgba(30,144,255,0.8)',
                    // borderWidth: 1,
                     borderColor: '#fff',
                     shadowColor : '#fff', //默认透明
                     shadowBlur: 5,
                     width: 40,
                     height:20,
                    //  offsetCenter: [25, '20%'],       // x, y，单位px
                     textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                         fontWeight: 'normal',
                         color: '#a4c1e8',
                         fontSize: 10
                     },
                 },
                data:[{value: 0, name: '角速度(%/s)'}]
            }
        ]
      };
      self.myChart.setOption(self.option);
      // setInterval(function(){
      //   console.log(w);
      //   option.series[0].data[0].value = v;
      //   option.series[1].data[0].value = w;
      //   // option.series[2].data[0].value = (Math.random()*2).toFixed(2) - 0;
      //   // option.series[3].data[0].value = (Math.random()*2).toFixed(2) - 0;
      //   myChart.setOption(option);
      // },500);
    }
    this.activeChart = function(info){
      self.chart_active = true;
    }
    this.methods = {
      "create":this.init,
      "active":this.active,
      "createChart":this.createChart,
      "activeChart":this.activeChart
    };
    this.methods[method](parameters);

    // this.init();
  }
  //end of controller
  //
  // this.Parts()
  //
  this.Light = function(method, parameters){
    // parameters={"dom":["ui buttons:eq(1)","ui buttons:eq(2)"],"light":["led","flash"],"range":[2,3]}
    //range not include unchange status 9.
    // this.lights = [];
    var self = this;
    this.init = function(info){
      self.lights = {};
      //assume that all light should be closed at first, we can fix this by latetr ajax data;
      for(var i=0;i<info["light"].length;i++)
      {
        self.lights[info["light"][i]] = 0;
      }

      function addDo(i)
      {
        self.lights[info["light"][i]] = (self.lights[info["light"][i]] + 1) % info["range"][i];
        console.log(self.lights);
        var Ltmp = {};//tmp for lights status
        for(var j=0;j<info["light"].length;j++)
        {
          Ltmp[info["light"][j]] = 9;
        }
        Ltmp[info["light"][i]] = self.lights[info["light"][i]];
        Ltmp["rid"] = info.rid;
        console.log(Ltmp);
        $.ajax({
          url:info["url"],
          method:"post",
          dataType:"json",
          data:Ltmp,
          success:function(resp){
            console.log(info["light"][i]);
            console.log(resp);
            // self.lights = resp;
          }
        });//end of ajax
        // you should delete the following line!!
        $(".ui.teal.inverted.segment").text(JSON.stringify(self.lights));
      }
      for(var i=0;i<info["dom"].length;i++)
      {

        $(info["dom"][i]).click((function(i){
          return function(){
            addDo(i);
          }
        })(i));

      }
    }
    this.check = function(info){
      return self.lights;
    }
    this.methods = {
      "create":this.init,
      "check":this.check
    }
    this.methods[method](parameters);
    // this.init(parameters);
  }
  /*
  *VisualTable
  *@parameter:method :[" "]
  */
  //{url:"/api",value:{"temp":".line:eq(1)","pm10":".line:eq(2)"}}
  //旧web页面环境数据实时更新表
  this.VisualTable = function(parameters,map){

    this.update = function(parameters,map){
      setInterval(function(){
        $.ajax({
          url:parameters["url"],
          method:"post",
          dataType:"json",
          data:{
            rid:info.rid,
            type:Object.keys(map),
            period:parameters["period"],
            density:parameters["density"]
          },
          success:function(resp){
            // console.log(map);
            var tmp_keys = Object.keys(resp);
            for(var i=0;i<tmp_keys.length;i++){
              $(map[tmp_keys[i]]).text(Math.round(resp[tmp_keys[i]]));
            }
          }
        });
      },parameters["density"]);

    }
    this.update(parameters,map);
  }
  //六路视频插件(要求提供相应的div与css格式)
  this.SixVideos = function(method,parameters){
    var self = this;
    this.init = function(info){
      if(info.url.length >= 6)
      {
        for(var i=0;i<5;i++)
        {
          $(".videos .video:eq("+i+")").append(
            "<video id='"+info.ids+"-"+i+"'  playsInline webkit-playsinline autoplay >" +
            "<source src='"+info.url[i][1].slice(0,-3)+"'  />"+
            "<source src='"+info.url[i][0]+"' type='application/x-mpegURL' />" +
            // "<source src='"+info.url[i][0]+"' type='application/x-mpegURL' />" +

          "</video>");
        }
        $(".videos .video:eq("+i+")").append(
          "<video id='"+info.ids+"-"+i+"'  playsInline webkit-playsinline autoplay >" +
          "<source src='"+info.url[i][1]+"'  />"+
          "<source src='"+info.url[i][0]+"' type='application/x-mpegURL' />" +
          // "<source src='"+info.url[i][0]+"' type='application/x-mpegURL' />" +

        "</video>");
        self.player = [];
        for(var i=0;i<6;i++){
          self.player[i] = new EZUIPlayer('myPlayer-'+i);
          // self.player[i] = videojs(info.ids+'-'+i);
          // self.player[i].play();
          self.player[i].on('error', function(){
            console.log('error');
          });
          self.player[i].on('play', function(){
            console.log('play');
          });
          self.player[i].on('pause', function(){
            console.log('pause');
          });
        }
      }
      else{
        for(var i=0;i<6;i++)
        {
          var ind = (i+4)%6;
          // $(".video:eq("+i+")").append("<video src='../videos/init"+ind+".mp4' autoplay loop muted></video>");
        }
      }

      $(".videos-left").css({"width":2*(info.x+info.h)});
      // $(".videos-right").css({"width":2*(x+h)});
      $(".videos .video:eq(0)").css({"width":2*info.x+info.h,"height":(2*info.x+info.h)*info.y/info.x});
      $(".videos .video:eq(1)").css({"width":info.x,"height":info.y});
      $(".videos .video:eq(2)").css({"width":info.x,"height":info.y});
      $(".videos .video:eq(3)").css({"width":info.x,"height":info.y});
      $(".videos .video:eq(4)").css({"width":info.x,"height":info.y});
      $(".videos .video:eq(5)").css({"width":2*info.x/info.y*(info.h+info.y)+2*info.x+info.h,"height":2*(info.h+info.y)+info.y/info.x*(2*info.x+info.h)});


      $(".videos video:eq(0)").css({"width":2*info.x+info.h,"height":(2*info.x+info.h)*info.y/info.x});
      $(".videos video:eq(1)").css({"width":info.x,"height":info.y});
      $(".videos video:eq(2)").css({"width":info.x,"height":info.y});
      $(".videos video:eq(3)").css({"width":info.x,"height":info.y});
      $(".videos video:eq(4)").css({"width":info.x,"height":info.y});
      $(".videos video:eq(5)").css({"width":2*info.x/info.y*(info.h+info.y)+2*info.x+info.h,"height":2*(info.h+info.y)+info.y/info.x*(2*info.x+info.h)});
      console.log(true);
      console.log($(".videos .video div")[0]);

      $(".videos #myPlayer-0flashId").ready(function(){
        $(".videos #myPlayer-0flashId").css({"width":2*info.x+info.h,"height":(2*info.x+info.h)*info.y/info.x});
      });
      $(".videos #myPlayer-1flashId").ready(function(){
        $(".videos #myPlayer-1flashId").css({"width":info.x,"height":info.y});
      });
      $(".videos #myPlayer-2flashId").ready(function(){
        $(".videos #myPlayer-2flashId").css({"width":info.x,"height":info.y});
      });
      $(".videos #myPlayer-3flashId").ready(function(){
        $(".videos #myPlayer-3flashId").css({"width":info.x,"height":info.y});
      });
      $(".videos #myPlayer-4flashId").ready(function(){
        $(".videos #myPlayer-4flashId").css({"width":info.x,"height":info.y});
      });
      $(".videos #myPlayer-5flashId").ready(function(){
        $(".videos #myPlayer-5flashId").css({"width":2*info.x/info.y*(info.h+info.y)+2*info.x+info.h,"height":2*(info.h+info.y)+info.y/info.x*(2*info.x+info.h)});
      });
      // $(".videos .myPlayer-0-dimensions").css({"width":2*info.x+info.h,"height":(2*info.x+info.h)*info.y/info.x});
      // $(".videos .myPlayer-1-dimensions").css({"width":info.x,"height":info.y});
      // $(".videos .myPlayer-2-dimensions").css({"width":info.x,"height":info.y});
      // $(".videos .myPlayer-3-dimensions").css({"width":info.x,"height":info.y});
      // $(".videos .myPlayer-4-dimensions").css({"width":info.x,"height":info.y});
      // $(".videos .myPlayer-5-dimensions").css({"width":2*info.x/info.y*(info.h+info.y)+2*info.x+info.h,"height":2*(info.h+info.y)+info.y/info.x*(2*info.x+info.h)});
    }
    this.switchable = function(info){
      for(var i=0;i<5;i++){
        $(".videos .video:eq("+i+")").click((function(i){
          return function(){
            var tmp;
            tmp = $(".videos .video:eq("+i+") video").attr("src");
            // console.log(tmp);
            $(".videos .video:eq("+i+") video").attr("src",$(".videos .video:eq(5) video").attr("src"));
            // console.log(tmp);
            $(".videos .video:eq(5) video").attr("src",tmp);
          };
        })(i));
      }
    }
    this.methods = {
      "locate":this.init,
      "switchable":this.switchable
    };
    this.methods[method](parameters);
  },
  //机器人电量插件
  this.Charge = function(method, parameters){
    var self = this;
    this.init = function(info){
      $(ele).css({
        "width":info.width,
        "height":info.height,
      });
      self.myChart = echarts.init($(ele)[0]);
      self.dataStyle = {
          normal: {
              label: {
                  show: false
              },
              labelLine: {
                  show: false
              },
              shadowBlur: 40,
              shadowColor: 'rgba(40, 40, 40, 0.5)',
          }
      };
      self.placeHolderStyle = {
          normal: {
              color: '#e8769c',//未完成的圆环的颜色
              label: {
                  show: false
              },
              labelLine: {
                  show: false
              }
          },
          emphasis: {
              color: '#e8769c'//未完成的圆环的颜色
          }
      };
      self.option = {
          title: {
              text: '100%',
              x: 'center',
              y: 'center',
              textStyle: {
                  fontWeight: 'normal',
                  color: "#0bb6f0",
                  fontSize: info.titleSize
              }
          },
          backgroundColor: 'rgba(0,0,0,0)',
          color: ['#54C8FF', 'rgba(118, 215, 232, 0.47)', '#fff'],
          tooltip: {
              show: false,
              formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
              show: false,
              itemGap: 12,
              data: ['01', '02']
          },
          toolbox: {
              show: false,
              feature: {
                  mark: {
                      show: true
                  },
                  dataView: {
                      show: true,
                      readOnly: false
                  },
                  restore: {
                      show: true
                  },
                  saveAsImage: {
                      show: true
                  }
              }
          },
          series: [{
                  name: 'Line 1',
                  type: 'pie',
                  clockWise: false,
                  radius: [info.R1-5, info.R1],
                  itemStyle: self.dataStyle,
                  hoverAnimation: false,

                  data: [{
                          value: 100,
                          name: '01'
                      }, {
                          value: 0,
                          name: 'invisible',
                          itemStyle: self.placeHolderStyle
                      }

                  ]
              }, {
                  name: 'Line 2',
                  type: 'pie',
                  animation: false,
                  clockWise: false,
                  radius: [info.R2-2, info.R2],
                  itemStyle: self.dataStyle,
                  hoverAnimation: false,
                  tooltip: {
                      show: false
                  },
                  data: [{
                          value: 100,
                          name: '02',
                          itemStyle: {
                              emphasis: {
                                  color: '#313443'
                              }
                          }
                      }, {
                          value: 0,
                          name: 'invisible',
                          itemStyle: self.placeHolderStyle
                      }

                  ]
              },


          ]
      };
      self.myChart.setOption(self.option);
    }
    this.active = function(info){
      var ds_in_sec = info.density/1000;
      setInterval(function(){
        $.ajax({
          url:info.url,
          method:"post",
          dataType:"json",
          data:{
            type:["electricity"],
            rid:info.rid,
            period:info.period,
            density:ds_in_sec
          },
          success:function(resp){
            // console.log(resp);electricity
            console.log(resp);
            self.option.series[0].data[0].value = resp["electricity"];
            self.option.series[0].data[1].value = 100 - resp["electricity"];
            self.option.title.text = resp["electricity"]+"%";
            self.myChart.setOption(self.option);
          }
        });
      },info.density);

    }
    // this.init(parameters);
    this.methods = {
      "create":this.init,
      "active":this.active
    };
    this.methods[method](parameters);
  }
  //过去24小时环境数据可视化插件
  this.Environment = function(method, parameters){
    var self = this;
    this.init = function(info){
      $(ele).css({
        "width":info.width,
        "height":info.height
      });
      // console.log(info);
      // console.log($(ele)[0]);
      // console.log($(ele).css("width"));
      self.myChart = echarts.init($(ele)[0]);
      var data = [
          [1,0,0,0,0,0],
          [2,0,0,0,0,0],
          [3,0,0,0,0,0],
          [4,0,0,0,0,0],
          [5,0,0,0,0,0],
          [6,0,0,0,0,0],
          [7,0,0,0,0,0],
          [8,0,0,0,0,0],
          [9,0,0,0,0,0],
          [10,0,0,0,0,0],
          [11,0,0,0,0,0],
          [12,0,0,0,0,0],
          [13,0,0,0,0,0],
          [14,0,0,0,0,0],
          [15,0,0,0,0,0],
          [16,0,0,0,0,0],
          [17,0,0,0,0,0],
          [18,0,0,0,0,0],
          [19,0,0,0,0,0],
          [20,0,0,0,0,0],
          [21,0,0,0,0,0],
          [22,0,0,0,0,0],
          [23,0,0,0,0,0],
          [24,0,0,0,0,0],
      ];

      //这里会改变各个轴的名字
      var schema = [
          {name: 'time', index: 0, text: '时间'},
          {name: 'humidity', index: 1, text: '湿度'},
          {name: 'temperature', index: 2, text: '温度'},
          {name: 'pm10', index: 3, text: 'pm10'},
          {name: 'pm2.5', index: 4, text: 'PM2.5'},
          {name: 'smoke', index: 5, text: '烟雾'},
      ];

      var lineStyle = {
          normal: {
              width: 1,
              opacity: 0.5
          }
      };

      self.option = {
          backgroundColor: 'rgba(0,0,0,0)',
          // legend: {
          //     bottom: 10,
          //     data: ['3h'],
          //     data: ['3h'],
          //     itemGap: 20,
          //     textStyle: {
          //         color: '#fff',
          //         fontSize: 14
          //     }
          // },
          tooltip: {
              padding: 10,
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
              formatter: function (obj) {
                  var value = obj[0].value;
                  return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                      + obj[0].seriesName + ' ' + value[0] + '时间：'
                      // + value[7]
                      + '</div>'
                      + schema[1].text + '：' + value[1] + '<br>'
                      + schema[2].text + '：' + value[2] + '<br>'
                      + schema[3].text + '：' + value[3] + '<br>'
                      + schema[4].text + '：' + value[4] + '<br>'
                      + schema[5].text + '：' + value[5] + '<br>';
                      // + schema[6].text + '：' + value[6] + '<br>';
              }
          },
          // dataZoom: {
          //     show: true,
          //     orient: 'vertical',
          //     parallelAxisIndex: [0]
          // },
          parallelAxis: [
              {dim: 0, name: schema[0].text, inverse: true, max: 24, nameLocation: 'start'},
              {dim: 1, name: schema[1].text},
              {dim: 2, name: schema[2].text},
              {dim: 3, name: schema[3].text},
              {dim: 4, name: schema[4].text},
              {dim: 5, name: schema[5].text},
              // {dim: 6, name: schema[6].text}
              // {dim: 7, name: schema[7].text,
              // type: 'category', data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']}
          // ],
          ],
          visualMap: {
              show: true,
              min: 0,
              max: 24,
              dimension: 0,
              inRange: {
                  color: ['#f06776','#9b36eb','#49dbee'].reverse(),
                  // colorAlpha: [0, 1]
              }
          },
          parallel: {
              left: '5%',
              right: '5%',
              bottom: 5,
              parallelAxisDefault: {
                  type: 'value',
                  name: '温度',
                  nameLocation: 'end',
                  nameGap: 20,
                  nameTextStyle: {
                      color: '#a4c1e8',
                      fontSize: 12
                  },
                  axisLine: {
                      lineStyle: {
                          color: '#aaa'
                      }
                  },
                  axisTick: {
                      lineStyle: {
                          color: '#777'
                      }
                  },
                  splitLine: {
                      show: false
                  },
                  axisLabel: {
                      textStyle: {
                          color: '#a4c1e8'
                      }
                  }
              }
          },
          series: [
              {
                  name: 'oneday',
                  type: 'parallel',
                  lineStyle: lineStyle,
                  data: data,
                  smooth: true,
              }
          ]
      };
      self.myChart.setOption(self.option);
    }

    this.active = function(info){
      var ds_in_sec = info.density/1000,data=[],keys;
      $.ajax({
        url:info.url,
        method:"post",
        dataType:"json",
        data:{
          rid:info.rid,
          type:["humidity","pm25","pm10","smoke","temperature"],
          period:info.period,
          density:ds_in_sec
        },
        success:function(resp){
          console.log(resp);
          var keys_ = Object.keys(resp);
          for(var i=0;i<keys_.length;i++){
            // console.log(keys_[i]);
            if(resp[keys_[i]]==null)
            {
              delete resp[keys_[i]];
            }
          }
          // console.log(resp);
          keys = Object.keys(resp);
          for(var j=0,cols=resp[keys[0]].length;j<cols;j++)
          {
            data.push([]);
            data[j].push(24-j)
            for(var i=0,rows=keys.length;i<rows;i++)
            {
              data[j].push(resp[keys[i]][j]);
            }
          }
          // console.log(data);
          self.option.series[0].data = data;
          self.myChart.setOption(self.option);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
           console.log(XMLHttpRequest.status);
           console.log(XMLHttpRequest.readyState);
           console.log(textStatus);
          },
      })
    }
    this.methods = {
      "create":this.init,
      "active":this.active
    }
    this.methods[method](parameters);
  }
  // this.FaceDetection

}
function $rock(ele){
  if(!$rock.records[ele])
  {
    $rock.records[ele] = new rock(ele);
  }
  return $rock.records[ele];
}
$rock.records = {};
