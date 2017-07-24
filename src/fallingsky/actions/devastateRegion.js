import Action from './action';

class DevastateRegion extends Action {

    constructor(args) {
        super(args);

        this.regionId = args.regionId;
    }

    doExecute(state) {
        const region = state.regionsById[this.regionId];

        if(region.devastated()) {
            throw 'Invalid Devastate Action';
        }

        region.devastated(true);

        console.log('Devastating ' + region.name + '');
    }

    doUndo(state) {
        const region = state.regionsById[this.regionId];

        console.log('Removing devastation from ' + region.name);
        region.devastated(false);
    }

    instructions(state) {
        const region = state.regionsById[this.regionId];
        return ['Place devastated marker on ' + region.name];
    }

}

export default DevastateRegion
