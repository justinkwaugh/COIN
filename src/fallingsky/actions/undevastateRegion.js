import Action from './action';

class UndevastateRegion extends Action {

    constructor(args) {
        super(args);

        this.regionId = args.regionId;
    }

    doExecute(state) {
        const region = state.regionsById[this.regionId];

        if(!region.devastated()) {
            throw 'Invalid Undevastate Action';
        }

        region.devastated(false);

        console.log('Removing devastation from ' + region.name + '');
    }

    doUndo(state) {
        const region = state.regionsById[this.regionId];

        console.log('Re-devastating ' + region.name);
        region.devastated(true);
    }

    instructions(state) {
        const region = state.regionsById[this.regionId];
        return ['Remove devastated marker from ' + region.name];
    }

}

export default UndevastateRegion
