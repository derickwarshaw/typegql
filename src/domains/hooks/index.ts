import {
  registerFieldAfterHook,
  registerFieldBeforeHook,
  HookExecutor,
} from './registry';

export {
  fieldAfterHooksRegistry,
  fieldBeforeHooksRegistry,
  HookExecutor,
} from './registry';
export { HookError } from './error';

export function Before(hook: HookExecutor): PropertyDecorator {
  return (targetInstance: Object, fieldName: string) => {
    registerFieldBeforeHook(targetInstance.constructor, fieldName, hook);
  };
}

export function After(hook: HookExecutor): PropertyDecorator {
  return (targetInstance: Object, fieldName: string) => {
    registerFieldAfterHook(targetInstance.constructor, fieldName, hook);
  };
}

interface GuardOptions {
  msg: string;
}

export function Guard(
  guardFunction: HookExecutor<boolean>,
  options: GuardOptions,
): PropertyDecorator {
  return (targetInstance: Object, fieldName: string) => {
    const hook: HookExecutor = async (source, args, context, info) => {
      const isAllowed = await guardFunction(source, args, context, info);
      if (isAllowed !== true) {
        throw new Error(options.msg);
      }
    };
    registerFieldBeforeHook(targetInstance.constructor, fieldName, hook);
  };
}

export function createGuard(
  guardFunction: HookExecutor<boolean>,
  options: GuardOptions,
): PropertyDecorator {
  return (guardOptions: GuardOptions = options) => {
    return Guard(guardFunction, guardOptions);
  };
}