/**
 * For comment notification
 */
import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'

window.moment = moment
const appStage = document.getElementById('app-stage')

class CommentApp extends React.Component {

    /*static defaultProps = {
        commentList: commentData || [],
    }*/

    constructor(props) {
        super(props)
        this.state = {
            'commentList': commentData
        }
    }

    componentDidMount() {

    }

    removeSuccess(res, commentId) {
        if(res['state'] == 'succeed'){
            let comments = this.state.commentList
            let removedIndex = comments.findIndex(comment => comment.id === commentId)
            comments.splice(removedIndex, 1)

            this.setState({
                'commentList': comments
            })
            alert('删除成功')
        }
    }

    removeComment(commentId) {
        var self = this
        // self.removeSuccess({state: 'succeed'}, commentId)

        $.ajax({
            'url': `/notification/remove/${commentId}`,
            'type': 'POST',
            'dataType': 'json'
        })
        .success(res => {
            self.removeSuccess(res, commentId)
        })
        .fail((err) => {
            throw Error(err)
        })
    }

    readCommentSuccess(res, commentId) {
        if(res['state'] == 'succeed'){
            let comments = this.state.commentList
            let comment = comments.find(comment => comment.id === commentId)

            comment.status = 'read';

            this.setState({
                'commentList': comments
            })
        }
    }

    readComment(commentId) {
        let self = this
        let commentStatus = 'read'
        // self.readCommentSuccess({state: 'succeed'}, commentId)

        $.ajax({
            'url': `/notification/read/${commentId}`,
            'type': 'POST',
            'dataType': 'json'
        })
        .success(res => {
            self.readCommentSuccess(res, commentId)
        })
        .fail((err) => {
            throw Error(err)
        })
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="notification-list">
                <h3>Comment</h3>
                <table style={{
                    margin: '0 auto', 
                    width: '90%'
                }}>
                    <thead>
                        <tr>
                            <th>Nickname</th>
                            <th>Content</th>
                            <th>Create Time</th>
                            <th>Status</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.commentList.map(comment => 
                        <tr key={comment.id}>
                            <td>{comment.nickname}</td>
                            <td><a target="_blank" href={"/article/" + comment.article_id}>{comment.content}</a></td>
                            <td>{moment(comment.createdAt).fromNow()}</td>
                            <td className={comment.status}>{comment.status}</td>
                            <td>
                                <button onClick={this.removeComment.bind(this, comment.id)}>Del</button>
                                <button onClick={this.readComment.bind(this, comment.id)}>Read</button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                
            </div>
        )
    }
}

ReactDOM.render(<CommentApp />, appStage)