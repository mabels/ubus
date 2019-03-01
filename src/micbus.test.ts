import {
  MicBus,
  UMsg,
  MicBusCore,
  UMsgTypeCreate,
  UMsgTyp2String,
  UMsgTypeEq
} from '.';

test('micbus create', () => {
  const micbus = MicBus.create('app-name');
  expect(micbus).toBeTruthy();
  expect(micbus.appName).toBe('app-name');
});

test('micbus default name create', () => {
  const micbus = MicBus.create();
  expect(micbus).toBeTruthy();
  expect(micbus.appName).toBe('micbus');
});

test('micbus msgType', async () => {
  const pmsg = UMsgTypeCreate('meno');
  expect(pmsg).toBeInstanceOf(Promise);
  const msg = await pmsg;
  expect(msg.namespace).toEqual([]);
  expect(msg.name).toEqual('meno');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('');
  expect(msg.namespace).toEqual([]);
  expect(msg.name).toEqual('');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('hund.meno');
  expect(msg.namespace).toEqual(['hund']);
  expect(msg.name).toEqual('meno');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('hund....meno');
  expect(msg.namespace).toEqual(['hund']);
  expect(msg.name).toEqual('meno');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('.meno');
  expect(msg.namespace).toEqual([]);
  expect(msg.name).toEqual('meno');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('meno.');
  expect(msg.namespace).toEqual(['meno']);
  expect(msg.name).toEqual('');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('.meno.');
  expect(msg.namespace).toEqual(['meno']);
  expect(msg.name).toEqual('');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('meno.katze.meno');
  expect(msg.namespace).toEqual(['meno', 'katze']);
  expect(msg.name).toEqual('meno');
});

test('micbus msgType with namespace', async () => {
  const msg = await UMsgTypeCreate('meno.katze.meno.');
  expect(msg.namespace).toEqual(['meno', 'katze', 'meno']);
  expect(msg.name).toEqual('');
});

test('umsg2string', async () => {
  expect(UMsgTyp2String(await UMsgTypeCreate(''))).toBe('');
});

test('umsg2string', async () => {
  expect(UMsgTyp2String(await UMsgTypeCreate('meno.doof'))).toBe('meno.doof');
});

test('umsg2string', async () => {
  expect(UMsgTyp2String(await UMsgTypeCreate('meno.doof.'))).toBe('meno.doof.');
});

test('umsg2string', async () => {
  expect(UMsgTyp2String(await UMsgTypeCreate('.meno.doof.'))).toBe('meno.doof.');
});

test('micbus send msg', async () => {
  const micbus = MicBus.create('app-name');
  const type = await UMsgTypeCreate('meno');
  const msg = await micbus.send({ type });
  expect(msg.id).toBeTruthy();
  expect(msg.src).toBeTruthy();
  expect(msg.dst).toBe('*');
  expect(msg.type).toEqual(type);
  expect(msg.payload).toBeFalsy();
});

test('micbus send msg full', async () => {
  const micbus = MicBus.create('app-name');
  const type = await UMsgTypeCreate('meno');
  const msg = await micbus.send({
    id: 'id',
    src: 'src',
    dst: 'dst',
    type,
    payload: 'payload'
  });
  expect(msg.id).toBe('id');
  expect(msg.src).toBe('src');
  expect(msg.dst).toBe('dst');
  expect(msg.type).toEqual(type);
  expect(msg.payload).toBe('payload');
});

test('micbus pre register event', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    let msg: UMsg;
    await micbus.register(type, inMsg => {
      expect(msg).toBe(inMsg);
      done();
    });
    msg = await micbus.send({
      type,
      payload: 'payload'
    });
  })();
});

test('micbus post register events', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const msg = await micbus.send({
      id: 'id',
      src: 'src',
      dst: 'dst',
      type,
      payload: 'payload'
    });
    await micbus.register(type, inMsg => {
      expect(msg).toBe(inMsg);
      done();
    });
  })();
});

test('micbus pre multiple register events', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    await Promise.all(
      ['a', 'b', 'c', 'd'].map(i =>
        micbus.send({
          id: `id${i}`,
          src: 'src',
          dst: 'dst',
          type,
          payload: 'payload'
        })
      )
    );
    await micbus.register(type, inMsg => {
      expect(inMsg.id).toBe('idd');
      done();
    });
  })();
});

test('micbus post multiple register events', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const data = ['a', 'b', 'c', 'd'];
    const fn = jest.fn();
    await micbus.register(type, inMsg => {
      fn(inMsg);
      if (fn.mock.calls.length == data.length) {
        expect(fn.mock.calls.map(i => i[0].id)).toEqual([
          'ida',
          'idb',
          'idc',
          'idd'
        ]);
        done();
      }
    });
    await Promise.all(
      data.map(i =>
        micbus.send({
          id: `id${i}`,
          src: 'src',
          dst: 'dst',
          type,
          payload: 'payload'
        })
      )
    );
  })();
});

test('micbus post multiple register events', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const data = ['a', 'b', 'c', 'd'];
    const fn = jest.fn();
    await micbus.register(type, inMsg => {
      fn(inMsg);
      if (fn.mock.calls.length == data.length) {
        expect(fn.mock.calls.map(i => i[0].id)).toEqual([
          'ida',
          'idb',
          'idc',
          'idd'
        ]);
        done();
      }
    });
    const handle = await micbus.register(type, async inMsg => {
      if (inMsg.id == 'ida') {
        await handle.unregister();
        return;
      }
      fail('should not be called');
    });
    await Promise.all(
      data.map(i =>
        micbus.send({
          id: `id${i}`,
          src: 'src',
          dst: 'dst',
          type,
          payload: 'payload'
        })
      )
    );
  })();
});

test('micbus multiple register handle', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const fns = ['fn1', 'fn2', 'fn3', 'fn4'];
    const msg = ['a', 'b', 'c', 'd'];
    let fnsCount = 0;
    await Promise.all(
      fns.map(fn => {
        const my = jest.fn((_: UMsg) => fn);
        return micbus.register(type, inMsg => {
          my(inMsg);
          if (my.mock.calls.length === msg.length) {
            expect(my.mock.calls.map(i => i[0].id)).toEqual([
              'ida',
              'idb',
              'idc',
              'idd'
            ]);
            fnsCount++;
          }
          if (fnsCount >= fns.length) {
            done();
          }
        });
      })
    );
    await Promise.all(
      ['a', 'b', 'c', 'd'].map(i =>
        micbus.send({
          id: `id${i}`,
          src: 'src',
          dst: 'dst',
          type,
          payload: 'payload'
        })
      )
    );
  })();
});

test('micbus send core event', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const collector = jest.fn();
    await micbus.register(MicBusCore.SendType, (inMsg: MicBusCore.SendMsg<UMsg>) => {
      collector(inMsg);
      // console.log(inMsg.payload.msg.type);
      if (UMsgTypeEq(inMsg.payload.msg.type, type)) {
        expect(collector.mock.calls.length).toEqual(2);
        expect(
          UMsgTypeEq(
            collector.mock.calls[0][0].payload.msg.type,
            MicBusCore.RegisterType
          )
        ).toBeTruthy();
        expect(UMsgTypeEq(inMsg.type, MicBusCore.SendType)).toBeTruthy();
        expect(inMsg.payload.msg.id).toBe('idjo');
        expect(inMsg.payload.msg.payload).toBe('payload');
        done();
      }
    });
    await micbus.send({
      id: `idjo`,
      src: 'src',
      dst: 'dst',
      type,
      payload: 'payload'
    });
  })();
});

test('micbus register core event', done => {
  (async () => {
    const micbus = MicBus.create('app-name');
    const type = await UMsgTypeCreate('meno');
    const _42 = () => 42;
    const collector = jest.fn();
    await micbus.register(
      MicBusCore.UnRegisterType,
      (inMsg: MicBusCore.RegisterMsg) => {
        try {
          expect(UMsgTypeEq(inMsg.type, MicBusCore.UnRegisterType)).toBeTruthy();
          expect(
            UMsgTypeEq(inMsg.payload.container.msgType, type)
          ).toBeTruthy();
          expect(inMsg.payload.container.actions).toEqual([]);
          expect(inMsg.payload.fn(undefined)).toBe(42);
          done();
        } catch (e) {
          done(e);
        }
      }
    );
    await micbus.register(
      MicBusCore.RegisterType,
      (inMsg: MicBusCore.RegisterMsg) => {
        collector(inMsg);
        try {
          if (UMsgTypeEq(inMsg.payload.container.msgType, type)) {
            expect(UMsgTypeEq(inMsg.type, MicBusCore.RegisterType)).toBeTruthy();
            expect(
              UMsgTypeEq(inMsg.payload.container.msgType, type)
            ).toBeTruthy();
            expect(inMsg.payload.container.actions).toEqual([_42]);
            expect(inMsg.payload.fn(undefined)).toBe(42);
          }
        } catch (e) {
          done(e);
        }
      }
    );
    await (await micbus.register(type, _42)).unregister();
  })();
});
