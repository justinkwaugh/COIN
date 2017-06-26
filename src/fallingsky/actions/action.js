import _ from '../../lib/lodash';

class Action {

    constructor(args) {

    }

    isValid() {
        return true;
    }

    static run(state, args) {
        const action = new this(args);
        action.doExecute(state);
        state.history.addAction(action);
    }

    doUndo() {

    }


    doExecute() {

    }

    static canExecute(args) {
        return true;
    }

    static execute(args) {

    }

    static perform(state, args, force) {
        let canExecute = true;
        const resolvedArgs = this.resolveIds(state, args);

        if (!force) {
            canExecute = this.canExecute(state, resolvedArgs);
        }

        if (canExecute) {
            this.execute(state, resolvedArgs);
            return true;
        }

        return false;
    }

    static resolveIds(state, args) {
        if (!args) {
            return;
        }

        const resolvedArgs = _.clone(args);
        _.each(args, function (value, key) {
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

export default Action;