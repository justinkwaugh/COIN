import BelgaeRally from 'fallingsky/bots/belgae/belgaeRally';
import TurnContext from 'common/turnContext';


class Event34 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e34',
                                             free: true,
                                             noSpecial: true,
                                             context: {acco: true}
                                         }));
        const effective = BelgaeRally.rally(state, turn.getContext());
        turn.popContext();

        return effective;
    }
}

export default Event34;
