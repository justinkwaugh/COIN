import Action from './action'

class DisperseTribe extends Action {

    static canExecute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        return faction.hasAvailableDispersalTokens() && tribe.isSubdued();
    }

    static execute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        faction.removeDispersalToken();
        tribe.disperse();
    }
}

export default DisperseTribe
