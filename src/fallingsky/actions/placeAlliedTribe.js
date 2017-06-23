import Action from './action';

class PlaceAlliedTribe extends Action {

    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        return region.inPlay() && faction.hasAvailableAlliedTribe() && tribe.isSubdued();
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        const alliedTribe = faction.removeAlliedTribe();
        tribe.makeAllied(alliedTribe);
        region.addPiece(alliedTribe);
        console.log('Placing ' + faction.name + ' Ally in ' + tribe.name);
    }
}

export default PlaceAlliedTribe;