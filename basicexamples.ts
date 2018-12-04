/**
 * an example of traditional event driven programming style - this is what we are 
 * replacing with observable.
 * The following adds a listener for the mouse event
 * handler, sets p and adds or removes a highlight depending on x position
 */
function mousePosEvents() {
  const pos = document.getElementById("pos")!;

  document.addEventListener("mousemove", e => {
    const p = e.clientX + ', ' + e.clientY;
    pos.innerHTML = p;
    if (e.clientX > 400) {
      pos.classList.add('highlight');
    } else {
      pos.classList.remove('highlight');
    }
  });
}

/**
 * constructs an Observable event stream with three branches:
 *   Observable<x,y>
 *    |- set <p>
 *    |- add highlight
 *    |- remove highlight
 */
function mousePosObservable() {
  const 
    pos = document.getElementById("pos")!,
    o = Observable
          .fromEvent<MouseEvent>(document, "mousemove")
          .map(({clientX, clientY})=>({x: clientX, y: clientY})); //make simple variables into new combined datastructure object

  o.map(({x,y}) => `${x},${y}`)
    .subscribe(s => pos.innerHTML = s);

  o.filter(({x}) => x > 400)
    .subscribe(_ => pos.classList.add('highlight'));

  o.filter(({x}) => x <= 400)
    .subscribe(_ => pos.classList.remove('highlight'));
}

/**
 * animates an SVG rectangle, passing a continuation to the built-in HTML5 setInterval function.
 * a rectangle smoothly moves to the right for 1 second.
 */
function animatedRectTimer() {
  const svg = document.getElementById("animatedRect")!;
  let rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#11B3D7');  //#95B3D7
  const animate = setInterval(()=>rect.attr('x', 1+Number(rect.attr('x'))), 10);
  const timer = setInterval(()=>{
    clearInterval(animate);
    clearInterval(timer);
  }, 3000);
}

/**
 * Demonstrates the interval method on Observable.
 * The observable stream fires every 10 milliseconds.
 * It terminates after 1 second (1000 milliseconds)
 */
function animatedRect() {
  const svg = document.getElementById("animatedRect")!;
  let rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#11B3D7');

  Observable.interval(10)
    .takeUntil(Observable.interval(3000))
    .subscribe(()=>rect.attr('x', 1+Number(rect.attr('x'))));
}

// an example of traditional event driven programming style - this is what we are 
// replacing with observable
// creates an SVG rectangle that can be dragged with the mouse
function dragRectEvents() {
  const svg = document.getElementById("dragRect")!,
    {left, top} = svg.getBoundingClientRect();
    
  const rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#11B3D7');

  rect.elem.addEventListener('mousedown', <EventListener>((e:MouseEvent)=>{
    const 
      xOffset = Number(rect.attr('x')) - e.clientX,
      yOffset = Number(rect.attr('y')) - e.clientY,
      moveListener = (e:MouseEvent)=>{
        rect
          .attr('x',e.clientX + xOffset)
          .attr('y',e.clientY + yOffset);
      },
      done = ()=>{
        svg.removeEventListener('mousemove', moveListener);
      };
    svg.addEventListener('mousemove', moveListener);
    svg.addEventListener('mouseup', done);
    svg.addEventListener('mouseout', done);
  }))
}

/**
 * Observable version of dragRectEvents:
 * Constructs an observable stream for the rectangle that
 * on mousedown creates a new stream to handle drags until mouseup
 *   O<MouseDown>
 *     | map x/y offsets
 *   O<x,y>
 *     | flatMap
 *     +---------------------+------------...
 *   O<MouseMove>          O<MouseMove>
 *     | takeUntil mouseup   |
 *   O<MouseMove>          O<MouseMove>
 *     | map x/y + offsets   |
 *     +---------------------+------------...
 *   O<x,y>
 *     | move the rect
 *    --- 
 */
function dragRectObservable0() {
  const 
    svg = document.getElementById("dragRect")!,
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
    rect = new Elem(svg, 'rect')
            .attr('x', 100)    .attr('y', 70)    // initial rect's coordinate 
            .attr('width', 120).attr('height', 80)
            .attr('fill', '#11B3D7');

  // in FRP, this will run as a loop forever
  rect.observe<MouseEvent>('mousedown')
    // mousedown drag start (x, y)
    .map(({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX,
                                    yOffset: Number(rect.attr('y')) - clientY })) 
    // operating actions on rect
    .flatMap(({xOffset, yOffset}) =>
      mousemove
        .takeUntil(mouseup)
        .map(({clientX, clientY}) => ({ x: clientX + xOffset, y: clientY + yOffset })))
    // set final position of rect
    .subscribe(({x, y}) =>
      rect.attr('x', x)
          .attr('y', y));
}

function dragRectObservable() {
  const 
  //svg is the targeted panel in html page, where we want the mouse events to be monitiored 
  svg = document.getElementById("dragRect")!,
 
  //An observable from traking mouse moves
  mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
 
  //An observable for tracking mouse ups.
  mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
  
  //draw a rect
  rect = new Elem(svg, 'rect')
  .attr('x', 100) .attr('y', 70)
  .attr('width', 120).attr('height', 80)
  .attr('fill', '#95B3D7');
 
  
  const 
  //An observable to track mousedown events in the rect we've given 
  mouseDownInRect = rect.observe<MouseEvent>('mousedown');
  mouseDownInRect.map(({clientX, clientY}) => ({ x: clientX,y: clientY })).subscribe(({x,y}) => console.log("Mouse down position at " + '{' + x,y +'}'));
  const 
  //An observable to track mousedown events that fix the (x, y)
  mouseDownOffset = mouseDownInRect.map(
  ({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX,
  yOffset: Number(rect.attr('y')) - clientY }));
  mouseDownOffset.subscribe(({xOffset, yOffset}) => console.log("The distance from the left corner of the rect to mouse down position" + '{' + xOffset, yOffset+'}'));
  const
  //An observale for mouse move events which completes at mouse up.
  mouseMoveTillMouseUp = mousemove.takeUntil(mouseup);
  mouseMoveTillMouseUp.map(({clientX, clientY}) => ({x:clientX, y:clientY})).subscribe(({x,y}) =>console.log("Mouse move positions till mouse up" + '{' +x,y +'}'));
  const
  //An observable to track mouseup events in the rect  
  trackingDraggedRect = mouseDownOffset.flatMap(({xOffset, yOffset}) => mouseMoveTillMouseUp.map(({clientX, clientY}) => ({ x: clientX + xOffset, y: clientY + yOffset })));
  trackingDraggedRect.subscribe(({x,y}) => console.log("The rect's new left corner position: " +'{' + x , y +'}'));
  
      //subscribe an observer to render the rect along with mourse moves till the position where mouse up 
      // Yes! After substribe, we can still call methods of this observable.
      // after subscribe just mean end of method chaining!
  trackingDraggedRect.map(({x, y}) => ({x: x, y: y})).subscribe(({x, y}) =>
  rect.attr('x', x)
  .attr('y', y));

 } 

/**
 * An example of traditional event driven programming style - this is what we are 
 * replacing with observable.
 * It allows the user to draw SVG rectangles by dragging with the mouse
 */
function drawRectsEvents() {
  const svg = document.getElementById("drawRects")!;

  svg.addEventListener('mousedown', e => {
    const 
      svgRect = svg.getBoundingClientRect(),
      x0 = e.clientX - svgRect.left,
      y0 = e.clientY - svgRect.top,
      rect = new Elem(svg, 'rect')
        .attr('x', String(x0))
        .attr('y', String(y0))
        .attr('width', '5')
        .attr('height', '5')
        .attr('fill', '#11B3D7');

    function moveListener(e: any) {
      const x1 = e.clientX - svgRect.left,
        y1 = e.clientY - svgRect.top,
        left = Math.min(x0, x1),
        top = Math.min(y0, y1),
        width = Math.abs(x0 - x1),
        height = Math.abs(y0 - y1);
        rect.attr('x', String(left))
            .attr('y', String(top))
            .attr('width', String(width))
            .attr('height', String(height));
    }

    function cleanup() {
      svg.removeEventListener('mousemove', moveListener);
      svg.removeEventListener('mouseup', cleanup);
    }

    svg.addEventListener('mouseup', cleanup);
    svg.addEventListener('mousemove', moveListener);
  });
}

// Draw version 1.0
/**
 * Observable version of the above
 */
// function drawRectsObservable() {
//   // implement this function!
//   const 
//     svg = document.getElementById("drawRects")!,
//     mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
//     mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
//     mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown');

//   mousedown.subscribe(({clientX, clientY}) => {
//     const 
//       svgRect = svg.getBoundingClientRect(),
//       rect = new Elem(svg, 'rect')

//         .attr('x', clientX-svgRect.left).attr('y', clientY-svgRect.top)    // initial rect's coordinate 
//         .attr('width', 5).attr('height', 5)
//         .attr('fill', '#11B3D7')


    
//     // operating actions on rect
//     // mousedown
//     // .map(({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX, yOffset: Number(rect.attr('y')) - clientY })) 
//     // .flatMap(({xOffset, yOffset}) =>
//     mousemove
//       .takeUntil(mouseup)
//       .map(({clientX, clientY}) => ({ 
//         x: Math.min(Number(rect.attr('x')), clientX-svgRect.left), 
//         y: Math.min(Number(rect.attr('y')), clientY-svgRect.top), 
//         width: Math.abs(Number(rect.attr('x'))-clientX+svgRect.left), 
//         height: Math.abs(Number(rect.attr('y'))-clientY+svgRect.top) }))
//     // set final position of rect
//       .subscribe(({x, y, width, height}) => 
//           rect.attr('x',x).attr('y', y).attr('width', width).attr('height', height));
//   })
// }


// Draw Version 2.0: set x0, y0 separate to avoid infinite changable x0, y0
function drawRectsObservable(){
    
  const 
    svg = document.getElementById("drawRects")!,
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
    mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown');

  mousedown.subscribe(({clientX, clientY}) => {


    const 
      svgRect = svg.getBoundingClientRect(),
      x0 = clientX-svgRect.left,
      y0 = clientY-svgRect.top,
      rect = new Elem(svg, 'rect')

        .attr('x', clientX-svgRect.left).attr('y', clientY-svgRect.top)    // initial rect's coordinate 
        .attr('width', 5).attr('height', 5)
        .attr('fill', '#11B3D7')

    mousemove
      .takeUntil(mouseup)
      .map(({clientX, clientY}) => {
        // const start = document.getElementById("start")!;
        // //const s = Number(rect.attr('x')) + ', ' + Number(rect.attr('y'));
        // const s = x0 + ', ' + y0;
        // start.innerHTML = s;

        // const end = document.getElementById("end")!;
        // const e = (clientX-svgRect.left) + ', '+(clientY-svgRect.top);
        // end.innerHTML = e;

        // const entity = document.getElementById("entity")!;
        // //const p = Math.abs(Number(rect.attr('x'))-clientX+svgRect.left) + ', ' + Math.abs(Number(rect.attr('y'))-clientY+svgRect.top);
        // const p = Math.abs(x0-clientX+svgRect.left) + ', ' + Math.abs(y0-clientY+svgRect.top);

        // entity.innerHTML = p;

        return { 
        x: Math.min(x0, clientX-svgRect.left), 
        y: Math.min(y0, clientY-svgRect.top), 
        width: Math.abs(x0-clientX+svgRect.left), 
        height: Math.abs(y0-clientY+svgRect.top) }
      })
    // set final position of rect
      .subscribe(({x, y, width, height}) => 
          rect.attr('x',x).attr('y', y).attr('width', width).attr('height', height));
  })
}




function drawRectsObservable2(svg:HTMLElement):Observable<Elem>{
    
  const 
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
    mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown');

  return mousedown.map(({clientX, clientY}) => {
    const 
      svgRect = svg.getBoundingClientRect(),
      x0 = clientX-svgRect.left,
      y0 = clientY-svgRect.top,
      rect = new Elem(svg, 'rect')
        .attr('x', clientX-svgRect.left).attr('y', clientY-svgRect.top)    // initial rect's coordinate 
        .attr('width', 5).attr('height', 5)
        .attr('fill', '#11B3D7');

    mousemove
      .takeUntil(mouseup)
      .subscribe(({clientX, clientY}) => {rect.attr('x', Math.min(x0, clientX-svgRect.left))
                                        .attr('y', Math.min(y0, clientY-svgRect.top))
                                        .attr('width', Math.abs(x0-clientX+svgRect.left))
                                        .attr('height', Math.abs(y0-clientY+svgRect.top))});

    return rect;
  })

}

function dragRectObservable2(svg: HTMLElement, rect: Elem) {
  const 
  //svg is the targeted panel in html page, where we want the mouse events to be monitiored 
 
  //An observable from traking mouse moves
  mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
 
  //An observable for tracking mouse ups.
  mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
  

  
  const 
  //An observable to track mousedown events in the rect we've given 
  mouseDownInRect = rect.observe<MouseEvent>('mousedown').map(e=>{e.stopPropagation(); return e}); // other observer don't have chance to observe MouseEvent
  //mouse.subscribe(e=>console.log("Stop Draw"));

  mouseDownInRect.map(({clientX, clientY}) => ({ x: clientX,y: clientY })).subscribe(({x,y}) => console.log("Mouse down position at " + '{' + x,y +'}'));
  const 
  //An observable to track mousedown events that fix the (x, y)
  mouseDownOffset = mouseDownInRect.map(
  ({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX,
  yOffset: Number(rect.attr('y')) - clientY }));
  mouseDownOffset.subscribe(({xOffset, yOffset}) => console.log("The distance from the left corner of the rect to mouse down position" + '{' + xOffset, yOffset+'}'));
  const
  //An observale for mouse move events which completes at mouse up.
  mouseMoveTillMouseUp = mousemove.takeUntil(mouseup);
  mouseMoveTillMouseUp.map(({clientX, clientY}) => ({x:clientX, y:clientY})).subscribe(({x,y}) =>console.log("Mouse move positions till mouse up" + '{' +x,y +'}'));
  const
  //An observable to track mouseup events in the rect  
  trackingDraggedRect = mouseDownOffset.flatMap(({xOffset, yOffset}) => mouseMoveTillMouseUp.map(({clientX, clientY}) => ({ x: clientX + xOffset, y: clientY + yOffset })));
  trackingDraggedRect.subscribe(({x,y}) => console.log("The rect's new left corner position: " +'{' + x , y +'}'));
  
      //subscribe an observer to render the rect along with mourse moves till the position where mouse up 
      // Yes! After substribe, we can still call methods of this observable.
      // after subscribe just mean end of method chaining!
  trackingDraggedRect.map(({x, y}) => ({x: x, y: y})).subscribe(({x, y}) =>
  rect.attr('x', x)
  .attr('y', y))

} 

/**
 * dragging on an empty spot on the canvas should draw a new rectangle.
 * dragging on an existing rectangle should drag its position.
 */
function drawAndDragRectsObservable() {
  // implement this function!
  // A problem to solve is how to drag a rectangle without starting to draw another rectangle?
  // Two possible solutions: 
  //  (1) introduce a "drag state" by mutating a top level variable at mousedown on the rectangle 
  //  (2) add a parallel subscription to mousedown that calls the "stopPropagation" method on the MouseEvent
  // Which one is better and why?
  // See if you can refactor the code from dragRectObservable and drawRectsObservable into reusable functions
  // that can be composed together to make drawAndDragRectsObservable almost trivial.
  
  const svg = document.getElementById("drawAndDragRects")!;
  if (svg != null)
    drawRectsObservable2(svg).map(rect=>dragRectObservable2(svg, rect)).subscribe(()=>console.log("done"));

}

if (typeof window != 'undefined')
  window.onload = ()=>{
    // old fashioned continuation spaghetti implementations:
    mousePosEvents();
    animatedRectTimer();
    //dragRectEvents();
    //drawRectsEvents();

    // when your observable is working replace the above four functions with the following:
    // mousePosObservable();
    // animatedRect()
    dragRectObservable();
    drawRectsObservable();

    // you'll need to implement the following function yourself:
    drawAndDragRectsObservable();
  }

