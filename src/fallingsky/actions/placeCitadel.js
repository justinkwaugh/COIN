import Action from './action';

class PlaceCitadel extends Action {
    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        return region.inPlay() &&
               faction.hasAvailableCitadel() &&
               tribe.isCity &&
               tribe.isAlliedToFaction(faction.id);
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        const removedAlliedTribe = region.removeAlliedTribe(region.id, tribe.id);
        faction.returnAlliedTribe(removedAlliedTribe);

        const citadel = faction.removeCitadel();
        tribe.buildCitadel(citadel);
        region.addPiece(citadel);
        console.log('Placing ' + faction.name + ' Citadel in ' + tribe.name);
    }
}

export default PlaceCitadel;