class Command {

    static doTest(state, args) {

    }

    static doExecute(state, args) {

    }

    static test(state, args) {
        const resolvedArgs = this.resolveIds(state, args);
        return this.doTest(state, resolvedArgs);
    }

    static execute(state, args) {
        const resolvedArgs = this.resolveIds(state, args);
        return this.doExecute(state, resolvedArgs);
    }

    static resolveIds(state, args) {
        if (!args) {
            return {};
        }

        const resolvedArgs = _.clone(args);
        _.each(
            args, function (value, key) {
                if (key.endsWith('Id')) {
                    const nonIdPropName = key.substring(0, key.length - 2);
                    if (!args[nonIdPropName]) {
                        const keylower = key.toLowerCase();
                        if (keylower.indexOf('faction') >= 0) {
                            resolvedArgs[nonIdPropName] = state.factionsById[value];
                        }
                        else if (keylower.indexOf('region') >= 0) {
                            resolvedArgs[nonIdPropName] = state.regionsById[value];
                        }
                        else if (keylower.indexOf('tribe') >= 0) {
                            resolvedArgs[nonIdPropName] = state.tribesById[value];
                        }
                    }
                }
            });
        return resolvedArgs;
    }
}

export default Command;