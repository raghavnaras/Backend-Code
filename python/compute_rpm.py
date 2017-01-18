"""
	Python code to be used in the Scalable Health Initiative Digital Gym researcvh project.

	Author: Connor Heggie
	Date: 11/14/2016

	Purpose: Analyze accelerometer data from exercise bike.

"""
import numpy as np
import json
import sys
def zeroCrossingsRPM(json):
	'''
	Uses zero crossings to get rpm
	param: dictionary with timestamp as string key, and 9 axis data as the values
	return: average rpm of the window
	'''
	data = readData(dict(json))
	Fs = 10.0;

	accel = data[:, 0:3]


	normX = np.linalg.norm(accel[:, 0])
	normY = np.linalg.norm(accel[:, 1])
	normZ = np.linalg.norm(accel[:, 2])

	if normX > normY and normX > normZ:
		maxAxis = accel[:, 0]
	elif normY > normX and normY > normZ:
		maxAxis = accel[:, 1]
	else:
		maxAxis = accel[:, 2]

	maxAxis = maxAxis - np.mean(maxAxis)
	avgAxis = np.copy(maxAxis)

	for i in range(3, len(maxAxis)):
		avgAxis[i] = .5*maxAxis[i] + .3*maxAxis[i-1] + .2*maxAxis[i-2]

	indiciesOfCrosses = [] 
	for i in range(len(avgAxis)-1):
		if np.logical_and(avgAxis[i+1] >= 0, avgAxis[i] < 0):
			indiciesOfCrosses.append(i)


	crossIndiciesToRemove = []

	for i in range(len(indiciesOfCrosses)):
		index = indiciesOfCrosses[i]
		try:
			if index <= 1:
				window = avgAxis[:6]
			elif index >= len(avgAxis) - 1:
				window = avgAxis[-6:]
			else:
				window = avgAxis[index-2:index+3]

			if np.linalg.norm(np.array(window), 1) <= .15:
				crossIndiciesToRemove.append(i)
		except:
			pass
	
	crossIndiciesToRemove.reverse()

	for i in range(len(crossIndiciesToRemove)):
		del indiciesOfCrosses[crossIndiciesToRemove[i]]

	# return indiciesOfCrosses
	
	if len(indiciesOfCrosses) == 0:
		return 0.0

	# Linear interpolation to find truer zero crossings
	crossings = np.array([i - avgAxis[i] / (avgAxis[i+1] - avgAxis[i]) for i in indiciesOfCrosses]).transpose()
	
	# Calculates the rpm
	rpm = Fs / np.average(np.diff(crossings)) * 60.0
	# rpm = Fs * length(indiciesOfCrosses) / length(avgAxis) * 60.0

	return rpm


def readData(json):
	'''
	param: dictionary with timestamp as string key, and 9 axis data as the values
	return: tuple with ordered list of timestamps and dictionary of key timestamp (int) and 9 axis list data
	'''
	newd = dict()
	ts = []

	for key, val in json.items():
		newkey = int(key[-5:])
		ts.append(int(key[-5:]))
		newd[newkey] = val


	ts = np.sort(ts) # Hopefully this sorts the calendar dates from least to greatest.

	try:
		data = np.matrix(newd[ts[0]])
		ts = ts[1:len(ts)-1]
	except:
		data = np.matrix(newd[ts[1]])
		ts = ts[2:len(ts)-1]
		pass

	for stamp in ts:
		try:
			cur9 = np.matrix(newd[stamp])
			data = np.append(data, cur9, axis=0)
		except:
			# print(stamp)
			pass

	return data

def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

if __name__ == '__main__':
	rpm_vals = []
	the_dict = read_in()
	for a in the_dict.keys():
		rpm_vals.append(zeroCrossingsRPM({a:the_dict[a]}))
	print rpm_vals


# FOR TESTING USING EXCEL FILES
# filename = 'Bike4.xlsx'

# data = np.matrix(pd.read_excel(filename))

# # print(data)
# print(zeroCrossingsRPM(data))


	
