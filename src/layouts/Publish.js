import React, {Component} from 'react';
import {View, Text, StyleSheet, PickerIOS, TouchableOpacity, TextInput, ScrollView, Dimensions, DeviceEventEmitter, LayoutAnimation, Picker, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Nav from '../components/Nav';
import Modal from '../components/base/Modal';
import Loading from '../components/base/Loading';
import config from '../configs/index';
import animations from '../configs/animations';


const {width, height} = Dimensions.get('window');

const PickerItemIOS = PickerIOS.Item;


class Publish extends Component {
	constructor(props) {
		super(props);
		this.tabs = {
			ask: 'Ask',
			share: 'Share',
			job: 'Career'
		};
		this.state = {
			selectTab: 'share',
			isPickerShow: false,
			dirty: false
		};
		this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
		this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
	}


	updateKeyboardSpace(e) {
		LayoutAnimation.configureNext(animations.keyboard.layout.spring);
		this.commentsView && this.commentsView.setNativeProps({
			style: {
				height: contentHeight - e.endCoordinates.height
			}
		})
	}

	resetKeyboardSpace() {
		LayoutAnimation.configureNext(animations.keyboard.layout.spring);
		this.commentsView && this.commentsView.setNativeProps({
			style: {
				height: contentHeight
			}
		})
	}


	componentDidMount() {
		DeviceEventEmitter.addListener('keyboardWillShow', this.updateKeyboardSpace);
		DeviceEventEmitter.addListener('keyboardWillHide', this.resetKeyboardSpace);
	}


	_blur() {
		this.titleInput.blur();
		this.contentInput.blur()
	}


	_validateForm() {
		if (!this.titleInputValue || this.titleInput == '') {
			return window.alert('Title cannot be empty')
		}

		if (!this.contentInputValue || this.contentInput == '') {
			return window.alert('Content cannot be empty')
		}

		if (this.titleInputValue.length <= 10) {
			return window.alert('Title must contains at least 10 character')
		}

		return true
	}


	_submit() {
		if (this.state.isPublishing || !this._validateForm()) return;

		this.setState({
			isPublishing: true
		});

		const {actions, publishPending, router} = this.props;

		actions.publish({
			title: this.titleInputValue,
			tab: this.state.selectTab,
			content: this.contentInputValue + '\n' + config.replySuffix,
			resolved: ()=> {
				actions.toast('Success');
				router.pop();
			},
			rejected: ()=> {
				actions.toast('Failed');
			}
		})

	}


	_onPickerPress() {
		this.setState({
			isPickerShow: true,
			dirty: true
		});
		this._blur()
	}


	_onPickerValueChange(tab) {
		this.setState({
			selectTab: tab
		})
	}


	_renderPickerContent() {
		return Object.keys(this.tabs).map(tab=> {
			return (
				<Picker.Item
					key={tab}
					value={tab}
					label={this.tabs[tab]}
				/>
			)
		})
	}


	_renderPicker() {
		if (Platform.OS === 'ios') {
			return (
				<TouchableOpacity
					onPress={this._onPickerPress.bind(this)}
				>
					<View style={styles.row}>
						<Icon
							name={'ios-keypad'}
							size={24}
							color='#1ABC9C'
							style={[styles.selectorIcon, styles.labelIcon]}
						/>

						<Text style={styles.tabSelectorText}>
							{this.state.dirty ? this.tabs[this.state.selectTab] : 'Please pick a topic'}
						</Text>

						<Icon
							name={'ios-arrow-right'}
							size={24}
							color='rgba(0,0,0,0.35)'
							style={styles.selectorIcon}
						/>
					</View>
				</TouchableOpacity>
			);
		}

		else {
			return (
				<View style={styles.row}>
					<Icon
						name={'ios-keypad'}
						size={24}
						color='#1ABC9C'
						style={[styles.selectorIcon, styles.labelIcon]}
					/>

					<Picker
						style={styles.pickerAndroid}
						selectedValue={this.state.selectTab}
						onValueChange={this._onPickerValueChange.bind(this)}>
						{this._renderPickerContent()}
					</Picker>
				</View>
			)
		}
	}


	render() {
		const {router, publishPending} = this.props;

		const navs = {
			Left: {
				text: 'Back',
				onPress: ()=> {
					router.pop();
					this._blur()
				}
			},
			Center: {
				text: 'Compose'
			},
			Right: {
				text: 'Post',
				onPress: ()=> this._submit()
			}
		};

		const modal = (
			<Modal
				onPressBackdrop={()=>{
						this.setState({
							isPickerShow: false
						});
					}}
				style={styles.modal}
			>
				<View style={styles.pickerIOS}>
					<Picker
						mode="dropdown"
						selectedValue={this.state.selectTab}
						onValueChange={this._onPickerValueChange.bind(this)}>
						{this._renderPickerContent()}
					</Picker>
				</View>
			</Modal>
		);


		return (
			<View style={styles.container}>
				<Nav
					navs={navs}
				/>

				<ScrollView
					ref={view=>this.contentView=view}
					style={styles.content}>

					{this._renderPicker()}

					<View style={styles.row}>
						<Icon
							name={'ios-add'}
							size={24}
							color='#1ABC9C'
							style={[styles.selectorIcon, styles.labelIcon]}
						/>

						<TextInput
							ref={view=>this.titleInput=view}
							placeholder='Please input the title'
							style={styles.titleInput}
							onChangeText={(text) => {
                                this.titleInputValue = text
                            }}
						/>
					</View>


					<TextInput
						ref={view=>this.contentInput=view}
						style={styles.topicContent}
						multiline={true}
						onChangeText={(text) => {
                            this.contentInputValue = text
                        }}
						placeholder="Please input the content here..."
					/>
				</ScrollView>

				{this.state.isPickerShow && modal}

				<Loading show={publishPending}/>
			</View>
		)
	}
}


const textColor = 'rgba(0,0,0,0.7)';
const contentHeight = height - 51 * 2 - Nav.navHeight;

const styles = StyleSheet.create({
	container: {
		height: height,
		width: width,
		backgroundColor: 'white'
	},
	row: {
		height: 51,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomColor: 'rgba(0,0,0,0.03)',
		borderBottomWidth: 1
	},
	selectorIcon: {
		height: 20,
		width: 20
	},
	labelIcon: {
		marginRight: 15
	},
	tabSelectorText: {
		flex: 1,
		color: textColor
	},
	titleInput: {
		height: 50,
		flex: 1,
		color: textColor,
		fontSize: 14
	},
	content: {
		paddingRight: 15,
		paddingLeft: 15
	},
	topicContent: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		paddingTop: 20,
		height: contentHeight
	},
	modal: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.4)'
	},
	pickerIOS: {
		flex: 1,
		height: 200,
		backgroundColor: 'white'
	},
	pickerAndroid: {
		flex: 1
	}
});


export const LayoutComponent = Publish;
export function mapStateToProps(state) {
	return {
		...state.topicUI
	};
}


