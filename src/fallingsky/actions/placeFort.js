import Action from './action';

class PlaceFort extends Action {

    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;

        return region.inPlay() && faction.hasAvailableForts() && !region.hasFort();
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;

        region.addPiece(faction.removeFort());
        console.log('Placing ' + faction.name + ' Fort in ' + region.name);
    }
}

export default PlaceFort;