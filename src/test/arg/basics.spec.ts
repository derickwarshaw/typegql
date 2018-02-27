import { GraphQLString } from 'graphql';
import { Field, Type, compileType, Arg } from 'domains';

describe('Arguments with @Arg', () => {
  it('Allows setting argument with @Arg decorator', () => {
    @Type()
    class Foo {
      @Field()
      bar(@Arg() baz: string): string {
        return baz;
      }
    }
    const { bar } = compileType(Foo).getFields();

    expect(bar.args.length).toEqual(1);
    const [bazArg] = bar.args;
    expect(bazArg.type).toBe(GraphQLString);
    expect(bazArg.name).toBe('baz');
  });

  it('Allows setting custom @Arg description', () => {
    @Type()
    class Foo {
      @Field()
      bar(
        @Arg({ description: 'test' })
        baz: string,
      ): string {
        return baz;
      }
    }
    const [bazArg] = compileType(Foo).getFields().bar.args;
    expect(bazArg.description).toBe('test');
  });

  it('Is passing argument value to resolver properly and in proper order', async () => {
    @Type()
    class Foo {
      @Field()
      bar(aaa: string, zzz: string): string {
        return `${aaa}.${zzz}`;
      }
    }
    const { bar } = compileType(Foo).getFields();
    const resolvedValue = await bar.resolve(
      new Foo(),
      { zzz: 'zzz', aaa: 'aaa' },
      null,
      null,
    );
    expect(resolvedValue).toEqual('aaa.zzz');
  });

  it('Is properly passing `this` argument', async () => {
    @Type()
    class Foo {
      private instanceVar = 'instance';
      @Field()
      bar(param: string): string {
        return `${this.instanceVar}.${param}`;
      }
    }
    const { bar } = compileType(Foo).getFields();
    const resolvedValue = await bar.resolve(new Foo(), { param: 'param' }, null, null);
    expect(resolvedValue).toEqual('instance.param');
  });

  it('Is properly passing `this` default values', async () => {
    @Type()
    class Foo {
      private instanceVar = 'instance';
      @Field() bar: string = this.instanceVar;
    }
    const { bar } = compileType(Foo).getFields();
    const resolvedValue = await bar.resolve(new Foo(), null, null, null);
    expect(resolvedValue).toEqual('instance');
  });
});
