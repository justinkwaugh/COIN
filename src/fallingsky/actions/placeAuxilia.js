import Action from './action';

class PlaceAuxilia extends Action {

    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        return region.inPlay() && faction.hasAvailableAuxilia(count);
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        region.addPieces(faction.removeAuxilia(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Auxilia in ' + region.name);
    }
}

export default PlaceAuxilia;