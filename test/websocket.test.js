"use strict";
  const $ = require('jquery');

  it('onopen WS', (done) => {
    const ws = new WebSocket('ws://127.0.0.1:5000'); 
          expect(ws.onopen = () => done()).not.toThrow();
            console.log("Connected!");
          ws.close();
        ws.onclose = () => done();
  });
  
	it('onmessage WS', (done) => {
    const ws = new WebSocket('ws://127.0.0.1:5000'); 
        ws.onmessage = (msg) => {
            expect(JSON.parse(msg.data)).toEqual({type: "clients", data: {number: 1}});
            ws.close();
        };
        ws.onclose = () => done();
  });

	it('onerror WS', (done) => {
    const ws = new WebSocket('ws://127.0.0.1:5000'); 
          expect(ws.onerror = () => done()).not.toThrow();
            console.log("Attention: we have an test!");
          ws.close();
        ws.onclose = () => done();
  });

  it('onclose WS', (done) => {
    const ws = new WebSocket('ws://127.0.0.1:5000'); 
          expect(ws.onclose = () => done()).not.toThrow();
            console.log("Websocket closed!");
          ws.close();
  });