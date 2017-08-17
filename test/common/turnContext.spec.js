import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState';
import RegionIDs from 'fallingsky/config/regionIds';

import TurnContext from 'common/turnContext';
import BattleResults from 'fallingsky/commands/battleResults';

describe("TurnContext", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
    });

    it('serializes / deserializes', function () {
        const turnContext = new TurnContext();
        const battle = new BattleResults({
                                              regionId: RegionIDs.MANDUBII,
                                              attackingPieces: belgae.removeWarbands(4)
                                          });


        turnContext.context.warbands = belgae.removeWarbands(2);
        turnContext.context.battles = [battle];
        turnContext.context.alliedTribe = belgae.removeAlliedTribe();
        turnContext.context.plainObject = {a: 'b'};
        turnContext.context.stringVal = 'abc';
        const id = turnContext.id;
        const json = turnContext.serialize();
        const restoredTurnContext = TurnContext.deserialize(json);
        expect(restoredTurnContext.id).to.equal(id);
        expect(restoredTurnContext.context.warbands.length).to.equal(2);
        expect(restoredTurnContext.context.warbands[0].status()).to.equal('hidden');
        expect(restoredTurnContext.context.alliedTribe.factionId).to.equal(belgae.id);
        expect(restoredTurnContext.context.plainObject.a).to.equal('b');
        expect(restoredTurnContext.context.stringVal).to.equal('abc');
        expect(restoredTurnContext.context.battles.length).to.equal(1);
        expect(restoredTurnContext.context.battles[0].regionId).to.equal(RegionIDs.MANDUBII);
        expect(restoredTurnContext.context.battles[0].attackingPieces.length).to.equal(4);
        expect(restoredTurnContext.context.battles[0].attackingPieces[0].status()).to.equal('hidden');
    });

});