import * as React from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";

interface SlackFile {
    id: string;
    name: string;
    size: number;
    external_type: string;
    permalink: string;
}

interface Props {}

interface State {
    error?: string;
    files: SlackFile[];
    loading: boolean;
}

const initialState: State = {
    error: undefined,
    files: [],
    loading: true,
};

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = initialState;
    }

    render() {
        if (this.state.error) {
            return (
                <div>
                    <h1>Error: {this.state.error}</h1>
                    <a href="/">back</a>
                </div>
            );
        }
        if (this.state.loading) {
            return <h1>loading...</h1>;
        }
        return (
            <div>
                <h1>files to delete</h1>
                <table>
                    <thead>
                        <tr>
                            <th>file</th>
                            <th>size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.files.map((v, i) => (
                            <tr key={i}>
                                <td>
                                    <a href={v.permalink}>{v.name}</a>
                                </td>
                                <td>{v.size}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={this.onClickDelete.bind(this)}>delete</button>
            </div>
        );
    }

    async componentDidMount() {
        const { data } = await axios.get("/files.list");
        if (!data.ok) {
            this.setState({ error: data.error });
            return;
        }
        const files: SlackFile[] = data.files;
        this.setState({ files: files.filter(v => v.external_type === ""), loading: false });
    }

    async onClickDelete() {
        const file = this.state.files[0];
        if (file === undefined) {
            return;
        }
        const resp = await axios.post("/files.delete", { id: file.id });
        if (!resp.data.ok) {
            this.setState({ error: resp.data.error });
            return;
        }
        this.setState({ files: this.state.files.slice(1) }, this.onClickDelete);
    }
}

ReactDOM.render(<App />, document.querySelector(".mount-point"));
