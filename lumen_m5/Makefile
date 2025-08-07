compile:
	arduino-cli compile
upload:
	arduino-cli upload --port /dev/ttyUSB1 --fqbn m5stack:esp32:m5stack_atom 
monitor:
	arduino-cli monitor --port /dev/ttyUSB1 --config 115200
main:
	make compile
	make upload
	make monitor
