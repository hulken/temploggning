Highcharts.Chart.prototype.callbacks.push(function(chart) {
  var hasTouch = document.documentElement.ontouchstart !== undefined,
      mouseTracker = chart.tracker,
      container = chart.container,
      mouseMove;

  mouseMove = function (e) {
    // let the system handle multitouch operations like two finger scroll
    // and pinching
    if (e && e.touches && e.touches.length > 1) {
      return;
    }

    // normalize
    e = mouseTracker.normalizeMouseEvent(e);
    if (!hasTouch) { // not for touch devices
      e.returnValue = false;
    }

    var chartX = e.chartX,
      chartY = e.chartY,
      isOutsidePlot = !chart.isInsidePlot(chartX - chart.plotLeft, chartY - chart.plotTop);

    // cancel on mouse outside
    if (isOutsidePlot) {

      /*if (!lastWasOutsidePlot) {
        // reset the tracker
        resetTracker();
      }*/

      // drop the selection if any and reset mouseIsDown and hasDragged
      //drop();
      if (chartX < chart.plotLeft) {
        chartX = chart.plotLeft;
      } else if (chartX > chart.plotLeft + chart.plotWidth) {
        chartX = chart.plotLeft + chart.plotWidth;
      }

      if (chartY < chart.plotTop) {
        chartY = chart.plotTop;
      } else if (chartY > chart.plotTop + chart.plotHeight) {
        chartY = chart.plotTop + chart.plotHeight;
      }
    }

    if (chart.mouseIsDown && e.type !== 'touchstart') { // make selection

      // determine if the mouse has moved more than 10px
      hasDragged = Math.sqrt(
        Math.pow(mouseTracker.mouseDownX - chartX, 2) +
        Math.pow(mouseTracker.mouseDownY - chartY, 2)
      );
      if (hasDragged > 10) {
        var clickedInside = chart.isInsidePlot(mouseTracker.mouseDownX - chart.plotLeft, mouseTracker.mouseDownY - chart.plotTop);

        // make a selection
        if (chart.hasCartesianSeries && (mouseTracker.zoomX || mouseTracker.zoomY) && clickedInside) {
          if (!mouseTracker.selectionMarker) {
            mouseTracker.selectionMarker = chart.renderer.rect(
              chart.plotLeft,
              chart.plotTop,
              zoomHor ? 1 : chart.plotWidth,
              zoomVert ? 1 : chart.plotHeight,
              0
            )
            .attr({
              fill: mouseTracker.options.chart.selectionMarkerFill || 'rgba(69,114,167,0.25)',
              zIndex: 7
            })
            .add();
          }
        }

        // adjust the width of the selection marker
        if (mouseTracker.selectionMarker && zoomHor) {
          var xSize = chartX - mouseTracker.mouseDownX;
          mouseTracker.selectionMarker.attr({
            width: mathAbs(xSize),
            x: (xSize > 0 ? 0 : xSize) + mouseTracker.mouseDownX
          });
        }
        // adjust the height of the selection marker
        if (mouseTracker.selectionMarker && zoomVert) {
          var ySize = chartY - mouseTracker.mouseDownY;
          mouseTracker.selectionMarker.attr({
            height: mathAbs(ySize),
            y: (ySize > 0 ? 0 : ySize) + mouseTracker.mouseDownY
          });
        }

        // panning
        if (clickedInside && !mouseTracker.selectionMarker && mouseTracker.options.chart.panning) {
          chart.pan(chartX);
        }
      }

    } else if (!isOutsidePlot) {
      // show the tooltip
      mouseTracker.onmousemove(e);
    }

    lastWasOutsidePlot = isOutsidePlot;
  }

  container.onmousemove = container.ontouchstart = container.ontouchmove = mouseMove;
});